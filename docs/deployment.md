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
9. **API deploy to Elastic Beanstalk** – `dotnet publish` the API, copy **`server/.ebextensions`** (and **`server/.platform`** if present) into the publish folder, zip that bundle, upload to S3 (in **us-east-1**), then create an EB application version and update the environment `justingritten-api-dev`. Version labels are unique per run (`api-<sha>-<run_id>-<run_attempt>`) to avoid collisions on re-runs. Each push to `main` deploys both the client and the API. The S3 bucket for the deployment package defaults to `elasticbeanstalk-us-east-1-305137865693`; override with repo variable **EB_S3_BUCKET** if your EB bucket has a different name.

## What is deployed

- **Client:** Built React SPA to S3/CloudFront. The client is built with **VITE_API_URL** pointing at your production API so contact form and visitor metrics work on the live site. Default workflow value is **`https://api.justingritten.dev`**; override via repo variable **VITE_API_URL** if needed.
- **API:** Deployed to Elastic Beanstalk (environment `justingritten-api-dev`, application `justingritten.dev.api`) in **us-east-1** as part of the same workflow.
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

Add these permissions to your role's policy in IAM (create or edit the policy in the console or in a private copy; do not commit full policy JSON to the public repo) (e.g. `github-actions-deploy-justingritten-dev`). If the workflow uses a different role name, update the workflow’s `role-to-assume` or ensure the workflow role-to-assume matches your role name.

**EB health check (fix "100% 4xx" / unhealthy):** The API exposes **GET /health** (returns 200). Set the environment **Application health check URL** to **`/health`** (also enforced via `server/.ebextensions/01-healthcheck.config` when the deploy bundle includes `.ebextensions`). For load-balanced environments, use **Configuration** → **Load balancer** → **Processes** → **Health check path** `/health`. For single-instance, use the health check URL in environment configuration so probes do not hit `/` (which returns 404 for this API).

**HTTPS for `api.justingritten.dev` (single-instance):** Use **CloudFront + ACM (us-east-1)** and Squarespace DNS as described in **CloudFront + Squarespace checklist** above. An ALB listener is not present after switching to single-instance.

## Local vs production

- **Local:** `npm run dev` in `client/` (e.g. http://localhost:5173). API URL defaults to http://localhost:5237 (see `client/.env.example`).
- **Production:** Static files on S3/CloudFront. The production build uses `VITE_API_URL` (recommended: `https://api.justingritten.dev`). When the site is served over HTTPS, the API URL must also be HTTPS.

## Future considerations

- If the API is hosted (e.g. on a separate subdomain), add a separate deploy job or workflow and ensure CORS and `VITE_API_URL` (or runtime config) point to that origin.
