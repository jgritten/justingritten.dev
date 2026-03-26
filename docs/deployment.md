# Deployment

How the portfolio site is built and published.

## Current pipeline

- **Trigger:** Push to `main` or manual `workflow_dispatch`.
- **Workflow:** `.github/workflows/deploy.yml` (test + build + deploy frontend and API).

## Steps

1. **Checkout** – Repo checkout.
2. **Node** – Setup Node 20 (`actions/setup-node@v6`), npm cache using `client/package-lock.json`.
3. **Install** – `npm ci` in `client/`.
4. **Test** – `npm run test` in `client/`. All tests must pass; the job fails and deploy is skipped if any test fails.
5. **Build** – `npm run build` in `client/` with **`VITE_API_URL`** set to the production API URL (so the deployed site calls your API, not localhost). The workflow defaults to **`https://api.justingritten.dev`**; override via repo variable **Settings → Actions → Variables → VITE_API_URL**.
6. **AWS** – OIDC to assume role `github-deploy-justingritten-dev` (`aws-actions/configure-aws-credentials@v6`) in `us-east-2`.
7. **S3 upload (three passes):**
   - **Assets** – `client/dist/assets` → `s3://justingritten.dev/assets` with long cache (`max-age=31536000, immutable`).
   - **Static files** – Rest of `client/dist` (excluding `assets/*` and `index.html`) with `max-age=86400`.
   - **index.html** – No cache (`no-cache, no-store, must-revalidate`) so new deploys are visible immediately.
8. **CloudFront** – Invalidation on `/*` (distribution id in workflow).
9. **API deploy to Elastic Beanstalk** – `dotnet publish` the API, copy `server/.platform` hooks into the publish bundle, zip the publish output, upload to S3 (in **us-east-1**), then create an EB application version and update the environment `justingritten-api-dev`. Version labels are unique per run (`api-<sha>-<run_id>-<run_attempt>`) to avoid collisions on re-runs. Each push to `main` deploys both the client and the API. The S3 bucket for the deployment package defaults to `elasticbeanstalk-us-east-1-305137865693`; override with repo variable **EB_S3_BUCKET** if your EB bucket has a different name.
10. **Post-deploy API verification** – after `update-environment`, the workflow waits for EB to report `Status=Ready` and `Health=Green|Ok`, checks EB events for any new **`ERROR`/`FATAL`** messages created during that deploy window, and then verifies `https://api.justingritten.dev/health`. The deploy fails if any of those checks fail.

## What is deployed

- **Client:** Built React SPA to S3/CloudFront. The client is built with **VITE_API_URL** pointing at your production API so contact form and visitor metrics work on the live site. Default workflow value is **`https://api.justingritten.dev`**; override via repo variable **VITE_API_URL** if needed.
- **API:** Deployed to Elastic Beanstalk (environment `justingritten-api-dev`, application `justingritten.dev.api`) in **us-east-1** as part of the same workflow.
- **Kestrel vs nginx (502 on `/health`):** On the **.NET on Linux** platform, EB’s nginx proxies to **port 5000** by default ([AWS docs](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/dotnet-linux-platform-nginx.html)). Newer ASP.NET Core can listen on **8080** when `ASPNETCORE_URLS` is unset, so nginx returns **502 Bad Gateway** even though EB health can still look fine. The API binds to **`PORT`** (if set) or **5000** in Production when `ASPNETCORE_URLS` is empty (`Program.cs`). If you override the proxy port in EB, set the **`PORT`** environment property to match.
- **API domain (single-instance, no ALB):** **`https://api.justingritten.dev`** should terminate TLS at **CloudFront** (ACM certificate in **us-east-1**), with the distribution origin set to the **EB environment URL** (HTTP to the instance Nginx → Kestrel). Do **not** rely on an ALB listener for HTTPS after switching to single-instance—the load balancer is removed for cost. Squarespace **`api`** CNAME should target the **CloudFront distribution hostname** (e.g. `dxxxx.cloudfront.net`), not an old ALB DNS name.

### CloudFront + Squarespace checklist (API HTTPS)

1. Request an **ACM certificate** in **us-east-1** for `api.justingritten.dev` (required for CloudFront).
2. Add ACM **DNS validation** records in Squarespace; keep them for renewal.
3. Create a **CloudFront distribution**: origin = EB environment URL (e.g. `justingritten-api-dev.eba-….elasticbeanstalk.com`), origin protocol **HTTP only** (port 80), viewer protocol **Redirect HTTP to HTTPS** or **HTTPS only**.
4. Attach the ACM cert to the distribution; set **Alternate domain name (CNAME)** `api.justingritten.dev`.
5. In Squarespace, set **`api`** CNAME to the **CloudFront domain name** from the distribution (not directly to EB if you want HTTPS on the custom domain).
6. After deploys that change API behavior, optionally invalidate CloudFront paths for the API distribution (or use short TTL on `default` behavior during testing).

## IAM and variables for API deploy

The GitHub OIDC role **github-deploy-justingritten-dev** must have, in addition to S3/CloudFront:

- **S3 (EB bucket):**
  - Object access for deploy and runtime copy paths (`s3:PutObject`, `s3:GetObject`, `s3:GetObjectAcl`, `s3:DeleteObject`, `s3:PutObjectAcl`) on `arn:aws:s3:::elasticbeanstalk-us-east-1-305137865693/*`
  - Bucket-level reads/config (`s3:CreateBucket`, `s3:PutBucketOwnershipControls`, `s3:PutBucketPublicAccessBlock`, `s3:GetBucketPublicAccessBlock`, `s3:GetBucketLocation`, `s3:ListBucket`, `s3:GetBucketPolicy`) on `arn:aws:s3:::elasticbeanstalk-us-east-1-305137865693`
- **Elastic Beanstalk (region us-east-1):** `elasticbeanstalk:CreateApplicationVersion`, `elasticbeanstalk:UpdateEnvironment`, `elasticbeanstalk:DescribeApplications`, `elasticbeanstalk:DescribeApplicationVersions`, `elasticbeanstalk:DescribeEnvironments`, `elasticbeanstalk:DescribeEvents`.
- **CloudFormation read (for EB stack introspection):** `cloudformation:GetTemplate`, `cloudformation:DescribeStacks`, `cloudformation:DescribeStackResources`, `cloudformation:DescribeStackResource`.
- **Auto Scaling / EC2 read-manage used by EB updates:** `autoscaling:DescribeAutoScalingGroups`, `autoscaling:SuspendProcesses`, `autoscaling:ResumeProcesses`, `ec2:DescribeLaunchTemplates`, `ec2:DescribeLaunchTemplateVersions`.

If the API deploy step fails with “Access Denied”, add these permissions to the role’s policy in IAM.

### SQLite persistence path during API deploys

- A predeploy hook (`server/.platform/hooks/predeploy/01_sqlite_backup_restore.sh`) now ensures `/var/app/data` exists with app-write permissions.
- The API connection string points to `Data Source=/var/app/data/justingritten.db`, which is outside `/var/app/current` so deploy bundle replacement does not reset the DB.
- On the first deploy after this change, the hook attempts a one-time migration copy from `/var/app/current/justingritten.db` to `/var/app/data/justingritten.db` if the new file does not exist yet.
- This approach avoids S3/AWS calls during startup hooks to reduce deploy-time instability.

### Operator access: SSH and the SQLite database (account owners only)

This is a **runbook for people who already administer your AWS account**. Putting it in a public repo does **not** let arbitrary readers connect to your instances: they still need **your** AWS sign-in, **your** IAM permissions, and (for classic SSH) **your** EC2 key pair’s private key material, plus a security group (or SSM policy) that allows access from **their** session. **Never commit** `.pem` files, passwords, Session Manager activation codes, or one-off connection strings to the repo.

**Database file on the instance:** `/var/app/data/justingritten.db` (table `ContactMessages`; use any SQLite client or the `sqlite3` CLI if installed on the AMI).

**Recommended approaches (pick what matches your environment):**

1. **AWS Systems Manager Session Manager** (no inbound TCP 22 required)  
   - If the EB instance is managed by SSM (SSM agent + instance profile with `AmazonSSMManagedInstanceCore` or equivalent), use **EC2 → Instances → Connect → Session Manager** in the console, or the AWS CLI `start-session` flow described in [AWS: Start a session](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-sessions-start.html).  
   - After the shell opens, run `sudo -i` if you need root to read under `/var/app/`.

2. **Elastic Beanstalk CLI** (SSH with your key pair)  
   - Install the [EB CLI](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install.html), configure it for **your** application and environment (names are internal; do not paste them into the public repo in issues or PRs if you treat them as sensitive).  
   - Run `eb ssh` as documented in [AWS: SSH into an Elastic Beanstalk environment](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb3-ssh.html). You must have associated an **EC2 key pair** with the environment and hold the matching private key locally.

3. **EC2 console / standard SSH**  
   - In **Elastic Beanstalk → your environment → Configuration → Instances**, note the instance or use **EC2 → Instances** filtered by the EB environment.  
   - Follow [AWS: Connect to your Linux instance using SSH](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AccessingInstancesLinux.html). The instance security group must allow SSH (typically port 22) from **your** IP or a bastion you control—avoid `0.0.0.0/0` on 22 for production.

**Inspecting or copying the database**

- **On-instance:** e.g. `sqlite3 /var/app/data/justingritten.db '.tables'` and `SELECT * FROM ContactMessages ORDER BY CreatedAt DESC LIMIT 20;` (adjust as needed).  
- **Off-instance:** use `scp` or Session Manager port forwarding to copy `justingritten.db` to a secure machine, then open it locally. Do not store copies in the git repo.

**Logs (no SSH):** Contact submissions are also logged at Information level (id, email, name) in the environment’s log stream (e.g. CloudWatch Logs for the EB log group). That complements the DB but does not replace it for full message bodies.

**Hardening note:** `GET /api/contact` returns recent messages as JSON and is currently **unauthenticated** in the API codebase. Treat that as a **known exposure** until you add auth or remove it; prefer SSH + SQLite or a future authenticated admin path for private review. Track any change in `docs/security.md` and consider an ADR if you introduce auth or remove the public listing.

Add these permissions to your role's policy in IAM (create or edit the policy in the console or in a private copy; do not commit full policy JSON to the public repo) (e.g. `github-actions-deploy-justingritten-dev`). If the workflow uses a different role name, update the workflow’s `role-to-assume` or ensure the workflow role-to-assume matches your role name.

**EB health check (fix "100% 4xx" / unhealthy):** The API exposes **GET /health** (returns 200). Set the environment **Application health check URL** to **`/health`** in Elastic Beanstalk environment configuration. For load-balanced environments, use **Configuration** → **Load balancer** → **Processes** → **Health check path** `/health`. For single-instance, use the health check URL in environment configuration so probes do not hit `/` (which returns 404 for this API).

**HTTPS for `api.justingritten.dev` (single-instance):** Use **CloudFront + ACM (us-east-1)** and Squarespace DNS as described in **CloudFront + Squarespace checklist** above. An ALB listener is not present after switching to single-instance.

## Local vs production

- **Local:** `npm run dev` in `client/` (e.g. http://localhost:5173). API URL defaults to http://localhost:5237 (see `client/.env.example`).
- **Production:** Static files on S3/CloudFront. The production build uses `VITE_API_URL` (recommended: `https://api.justingritten.dev`). When the site is served over HTTPS, the API URL must also be HTTPS.

## Contact email provider configuration (API)

Contact notification delivery is provider-agnostic and selected at runtime using `EMAIL_PROVIDER` in the API environment.

- `EMAIL_PROVIDER=Resend` (current production choice)
  - `RESEND_API_KEY`
  - `RESEND_FROM_EMAIL`
  - `CONTACT_TO_EMAIL`
  - `RESEND_CONTACT_TEMPLATE_ID` (published Resend template UUID for contact notifications; must match template variables in `docs/resend/templates/contact-email-template.resend.html`)
- `EMAIL_PROVIDER=Ses` (scaffolded; AWS SDK send logic can be added later)
  - `SES_REGION` (or `AWS_REGION`)
  - `SES_FROM_EMAIL`
  - `CONTACT_TO_EMAIL`
- Any other `EMAIL_PROVIDER` value falls back to `NoOp` (no email send, logs only).

## Future considerations

- If the API is hosted (e.g. on a separate subdomain), add a separate deploy job or workflow and ensure CORS and `VITE_API_URL` (or runtime config) point to that origin.

## Deploy troubleshooting playbook (rollback first)

When a deploy suddenly fails after a recent workflow/config edit, do this first:

1. **Diff the last working deploy commit vs current** for `.github/workflows/deploy.yml` and any related EB packaging files.
2. **Rollback the most recent workflow change only** and redeploy once before making broad IAM/network changes.
3. **Validate behavior at the edge and origin separately**:
   - `https://api.justingritten.dev/health` (CloudFront/custom-domain path)
   - `http://<eb-environment-url>/health` (direct EB origin path)
4. **Then escalate scope** (IAM/service role, VPC endpoint policy, EB service events) only if rollback testing does not restore deploys.

### Known regression check (March 2026)

- A deploy regression was resolved by rolling back a recently-added API packaging step in `.github/workflows/deploy.yml` that staged `server/.ebextensions`/`.platform` into the publish bundle.
- Keep this as an early diagnostic check before assuming new IAM permissions are required.
