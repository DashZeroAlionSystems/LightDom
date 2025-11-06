# Deployment guide (GitHub Actions)

This repo includes three GitHub Actions workflows to help with CI, integration tests, and deployments:

- `.github/workflows/ci.yml` — runs lint, TypeScript checks, and unit tests on PRs and pushes.
- `.github/workflows/integration.yml` — spins up the test docker-compose stack and runs integration tests.
- `.github/workflows/deploy.yml` — builds the project, creates a Docker image, and provides an optional SSH deploy step.

Required secrets and environment setup
------------------------------------

To allow deploys and registry pushes, add the following repository secrets (Settings → Secrets → Actions):

- `DOCKER_PUSH` — set to `true` to enable pushing built images to the registry. If set, also add credentials below.
- `CR_PAT` — (optional) personal access token for GHCR if pushing images. If using GHCR, ensure `CR_PAT` has appropriate write:packages scopes.
- `SSH_PRIVATE_KEY` — private key used to SSH to your server for the placeholder deploy step.
- `DEPLOY_HOST` — user@host or host:port for the optional SSH deployment step.

GitHub Container Registry (GHCR) notes
------------------------------------

If you plan to push Docker images to GitHub Container Registry (GHCR), create a personal access token and store it as `CR_PAT` in repo secrets. When `DOCKER_PUSH` is set to `true` the deploy workflow will log in to GHCR using that token and push the built image tagged with the commit SHA. Example minimal scopes: write:packages, read:packages.

CI helper scripts
------------------

The integration workflow uses `scripts/wait-for-services.sh` to wait for common services (Postgres, Redis) to become available on localhost. You can customize the script or add additional checks for Elasticsearch, RabbitMQ, etc.

Configure GitHub Environments
-----------------------------

This workflow uses the `environment` property (dev/staging/production). Create corresponding GitHub Environments (Settings → Environments) and configure required reviewers or environment-specific secrets (for example, `SSH_PRIVATE_KEY` per environment).

Notes about the optional SSH deploy step
--------------------------------------

The SSH deploy step is a placeholder and expects your target server to have a stable path (example: `/opt/lightdom/docker-compose.yml`) and Docker Compose installed. It executes a `docker pull` and `docker compose up -d` on the remote host. Customize that command to fit your infra.

Running the full project locally in CI
-------------------------------------

The Integration workflow uses `docker-compose.test.yml` (if present) or `docker-compose.yml`. Ensure that file brings up Postgres, Redis, and any other required services. The workflow uses the Docker Compose Action to orchestrate services and run `npm run test:integration`.

If you need help customizing deployments for a specific cloud provider (Azure Web Apps, AWS ECS, GCP Cloud Run, DigitalOcean App Platform), tell me which provider and I will add a provider-specific deploy job with secrets and example infra as code templates.
