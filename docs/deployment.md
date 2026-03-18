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

## What is deployed

- **Client:** Built React SPA to S3/CloudFront. The client is built with **VITE_API_URL** pointing at your production API so contact form and visitor metrics work on the live site.
- **API:** Deployed separately (e.g. Elastic Beanstalk); the workflow does not deploy the API.

## Local vs production

- **Local:** `npm run dev` in `client/` (e.g. http://localhost:5173). API URL defaults to http://localhost:5237 (see `client/.env.example`).
- **Production:** Static files on S3/CloudFront. The production build uses the API URL set in the workflow (default: your EB API URL over **HTTPS** so the browser does not block requests as mixed content). If you change the API URL (e.g. new EB environment or custom domain), set the repo variable **VITE_API_URL** in GitHub; it must be **HTTPS** when the site is served over HTTPS.

## Future considerations

- If the API is hosted (e.g. on a separate subdomain), add a separate deploy job or workflow and ensure CORS and `VITE_API_URL` (or runtime config) point to that origin.
