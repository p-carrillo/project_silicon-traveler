# Create box deployment directories in GitHub Actions

- **Monotask ID:** Not created — local definition only
- **Priority:** High
- **Status:** In progress — not synchronized
- **Category:** CI/CD

## Problem

The GitHub production deployment workflow creates only `${DEPLOY_PATH}`. Its next steps synchronize the deployable application to `${DEPLOY_PATH}/code/` and seed assets to `${DEPLOY_PATH}/context/pictures_seed/`. On a fresh deployment host, the nested `context` destination does not exist and `rsync` fails before the build begins.

Forgejo already creates both box-layout directories, so the two deployment workflows are not equivalent.

## Outcome

GitHub Actions creates the complete box deployment layout before either `rsync` command runs. A push to `main` can deploy to a fresh target directory without manually creating `code/` or `context/pictures_seed/` first.

## Scope

- Update `.github/workflows/deploy.yml` to create `${DEPLOY_PATH}/code` and `${DEPLOY_PATH}/context/pictures_seed` in the initial SSH setup step.
- Remove the pre-deployment filesystem assertion for the image proxy route. The post-deployment smoke test exercises that route through the running web service and is the authoritative check.
- Preserve the existing exclusions, environment creation, production Compose commands, and verification steps.
- Keep Forgejo and GitHub `main` synchronized, but run production deployment only from GitHub Actions. Remove the Forgejo deployment workflow to prevent duplicate production deploys.

## Acceptance criteria

- The GitHub workflow creates both nested deployment directories before synchronizing code or seed assets.
- The code and seed `rsync` targets match the directories created in that step.
- The workflow can progress past the synchronization step on a fresh deployment path.
- The image proxy is verified after deployment through its HTTP endpoint, rather than through an intermediate remote file check.
- A push to Forgejo does not initiate a production deployment.
- Forgejo `main` receives the same commit as GitHub `main`.

## Implementation plan

1. Amend the GitHub deployment-directory command to create both box-layout destinations atomically with `mkdir -p`.
2. Verify workflow YAML and review the resulting diff against Forgejo's existing setup step.
3. Commit with a Conventional Commit message, push the fast-forward commit to Forgejo and GitHub, and observe the triggered GitHub deployment.

## Risks and open decisions

- This fixes the fresh-path synchronization failure only. Deployment-host credentials, service health, and production secrets remain external prerequisites.
- GitHub log download requires authentication, so the public Actions job state is used to verify each step unless a valid GitHub CLI token is configured.
