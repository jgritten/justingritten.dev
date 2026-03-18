# Deployment

How the portfolio site is built and published.

## Current pipeline

- **Trigger:** Push to `main` or manual `workflow_dispatch`.
- **Workflow:** `.github/workflows/deploy.yml` (Deploy to S3 + CloudFront).

## Steps

1. **Checkout** – Repo checkout.
2. **Node** – Setup Node 20, npm cache using `client/package-lock.json`.
3. **Install** – `npm ci` in `client/`.
4. **Test** – `npm run test` in `client/`. All tests must pass; the job fails and deploy is skipped if any test fails.
5. **Build** – `npm run build` in `client/` with **`VITE_API_URL`** set to the production API URL (so the deployed site calls your API, not localhost). The workflow defaults to your Elastic Beanstalk API URL; override via repo variable **Settings → Actions → Variables → VITE_API_URL**.
6. **AWS** – OIDC to assume role `github-deploy-justingritten-dev` in `us-east-2`.
7. **S3 upload (three passes):**
   - **Assets** – `client/dist/assets` → `s3://justingritten.dev/assets` with long cache (`max-age=31536000, immutable`).
   - **Static files** – Rest of `client/dist` (excluding `assets/*` and `index.html`) with `max-age=86400`.
   - **index.html** – No cache (`no-cache, no-store, must-revalidate`) so new deploys are visible immediately.
8. **CloudFront** – Invalidation on `/*` (distribution id in workflow).
9. **API deploy to Elastic Beanstalk** – `dotnet publish` the API, zip the output, upload to S3 (in **us-east-1**), then create an EB application version and update the environment `justingritten-api-dev`. So each push to `main` deploys both the client and the API. The S3 bucket for the deployment package defaults to `elasticbeanstalk-us-east-1-305137865693`; override with repo variable **EB_S3_BUCKET** if your EB bucket has a different name.

## What is deployed

- **Client:** Built React SPA to S3/CloudFront. The client is built with **VITE_API_URL** pointing at your production API so contact form and visitor metrics work on the live site.
- **API:** Deployed to Elastic Beanstalk (environment `justingritten-api-dev`, application `justingritten.dev.api`) in **us-east-1** as part of the same workflow. Each push to `main` deploys both.

## IAM and variables for API deploy

The GitHub OIDC role **github-deploy-justingritten-dev** must have, in addition to S3/CloudFront:

- **S3:** `s3:PutObject`, `s3:GetObject` on the Elastic Beanstalk deployment bucket (default bucket name: `elasticbeanstalk-us-east-1-305137865693`). Set repo variable **EB_S3_BUCKET** if your bucket name is different.
- **Elastic Beanstalk (region us-east-1):** `elasticbeanstalk:CreateApplicationVersion`, `elasticbeanstalk:UpdateEnvironment`, `elasticbeanstalk:DescribeApplications`, `elasticbeanstalk:DescribeEnvironments`, and any other EB actions the deploy needs.

If the API deploy step fails with “Access Denied”, add these permissions to the role’s policy in IAM.

Add these permissions to your role's policy in IAM (create or edit the policy in the console or in a private copy; do not commit full policy JSON to the public repo) (e.g. `github-actions-deploy-justingritten-dev`). If the workflow uses a different role name, update the workflow’s `role-to-assume` or ensure the workflow role-to-assume matches your role name.

**EB health check (fix "100% 4xx" / ELB unhealthy):** The API exposes **GET /health** (returns 200). In EB → **justingritten-api-dev** → **Configuration** → **Load balancer** → **Processes** → edit the default process → set **Health check path** to **`/health`** and save. Then apply and redeploy so the ELB gets 200 instead of 404.

## Local vs production

- **Local:** `npm run dev` in `client/` (e.g. http://localhost:5173). API URL defaults to http://localhost:5237 (see `client/.env.example`).
- **Production:** Static files on S3/CloudFront. The production build uses the API URL set in the workflow (default: your EB API URL over **HTTPS** so the browser does not block requests as mixed content). If you change the API URL (e.g. new EB environment or custom domain), set the repo variable **VITE_API_URL** in GitHub; it must be **HTTPS** when the site is served over HTTPS.

## Future considerations

- If the API is hosted (e.g. on a separate subdomain), add a separate deploy job or workflow and ensure CORS and `VITE_API_URL` (or runtime config) point to that origin.
