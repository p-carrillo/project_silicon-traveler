---
name: docker-security-audit
description: "Audit Docker and Docker Compose deployments for security posture, focusing on secrets/API keys, image and dependency vulnerabilities, and risky runtime settings. Use when reviewing Dockerfiles, compose files, .env files, or a VPS Docker host before production."
---

# Docker Security Audit

## Overview

This skill provides a focused, repeatable workflow to audit Docker-based deployments on low-resource VPS hosts, with emphasis on secrets handling, image/dependency vulnerabilities, and risky Docker/Compose settings.

## Workflow

1. Scope and inventory
2. Static config review (Dockerfiles and Compose)
3. Secrets and API key exposure review
4. Vulnerability review (images and dependencies)
5. Runtime and host posture checks
6. Report and remediation plan

## Step 1: Scope and Inventory

Collect the deployment inputs and establish what will be audited.

- Dockerfiles and any base images
- `docker-compose.yml` and prod overrides
- `.env` files and referenced `env_file` paths
- CI/CD or deployment scripts that build/push images
- A list of running containers and images (if host access is available)

If the VPS is resource-constrained, plan to do heavier scanning on a workstation and only run minimal checks on the VPS.

Project-specific inputs for this repo:

- Compose files: `docker-compose.yml`, `docker-compose.prod.yml`
- Dockerfiles: `docker/Dockerfile.dev`, `docker/Dockerfile.prod`
- Services (prod): `mariadb`, `api`, `web`, `scheduler`
- Services (dev): `mariadb`, `app`, `api`, `web`, `scheduler`
- Ports (prod): `mariadb` -> `${DB_PORT:-3316}:3306`, `api` -> `3000:3000`, `web` -> `3001:3001`
- Ports (dev): `api` -> `3010:3000`, `web` -> `3011:3001`
- Env keys used: `DB_*`, `API_KEY`, `OPENAI_API_KEY`, `BRAVE_SEARCH_API_KEY`, `CORS_ORIGINS`, `API_URL`
- CI/CD: GitHub Actions
- Secrets: GitHub Actions Secrets

## Step 2: Static Config Review

Focus on configuration risks that are visible without running containers.

- Containers should not run as `root` unless justified
- Avoid `privileged: true` and unnecessary `cap_add`
- Avoid `network_mode: host` unless required
- Use read-only filesystems where feasible (`read_only: true`)
- Ensure volumes do not mount sensitive host paths (e.g., `/`, `/var/run/docker.sock`)
- Prefer fixed image tags or digests over `latest`
- Ensure healthchecks exist for critical services
- Check `restart` policies and logging settings
- Consider resource limits for low-resource VPS (`mem_limit`, `cpus`, or `deploy.resources` depending on Compose mode)

Useful commands:

```bash
rg -n "(privileged|cap_add|network_mode|read_only|user:|security_opt|docker.sock|restart:)" docker-compose*.yml
rg -n "^FROM" -g "Dockerfile*" .
```

## Step 3: Secrets and API Key Exposure Review

Identify hardcoded or leaked secrets in code and configuration.

- `.env` and `env_file` contents must not be committed
- `environment:` blocks should not contain raw secrets
- Search for common secret patterns in repo and git history
- Ensure secret rotation is feasible (document where secrets live)
- For GitHub Actions, ensure secrets are referenced via `${{ secrets.* }}` and never echoed in logs

Suggested checks:

```bash
rg -n "(API_KEY|SECRET|TOKEN|PASSWORD|PRIVATE_KEY|BEGIN RSA|BEGIN OPENSSH)" .
rg -n "(api_key|secret|token|password)" -g "*.yml" -g "*.env*" .
```

If available, prefer a dedicated secret scanner (e.g., gitleaks) and record tool availability in the report.

## Step 4: Vulnerability Review

Focus on image and dependency vulnerabilities with minimal load on the VPS.

- Scan built images for OS/package CVEs using a lightweight scan on the workstation
- Run dependency audits for the app (Node.js: `npm audit` or the repo's package manager)
- Confirm base images are supported and updated
- Avoid build-time secrets in Dockerfile `ARG` layers; prefer runtime env or BuildKit secrets

Example commands (run on workstation if possible):

```bash
# Image scan (example tool)
trivy image --severity HIGH,CRITICAL <image:tag>

# Node dependency audit (choose the repo's package manager)
npm audit --production
```

If tools are unavailable, document the gap and recommend the specific tool.

## Step 5: Runtime and Host Posture Checks

If you have host access, verify runtime posture with read-only checks.

- `docker info` for security options (seccomp, AppArmor)
- Container users and capabilities (`docker inspect`)
- Exposed ports and unintended services
- Logging and log rotation

Example commands:

```bash
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Ports}}'
docker inspect --format '{{.Name}} {{.Config.User}} {{.HostConfig.Privileged}}' $(docker ps -q)
```

If GitHub Actions is used for deployment, review workflows for:

- Secrets usage and masking
- No `set -x` or `echo` of secrets
- Image signing or digest pinning (if applicable)

## Step 6: Report and Remediation Plan

Provide a concise report with actionable remediation steps.

- Findings list with severity and evidence
- Impact and exploitability summary
- Recommended fixes and owners
- Follow-up tasks and validation steps

## Severity Rubric

- Critical: Active secret exposure, privileged container with public exposure, known exploitable CVE in internet-facing service
- High: Hardcoded secrets in repo, root containers with broad capabilities, high-severity CVEs in base images
- Medium: Missing healthchecks, broad network exposure, outdated base images without known exploit
- Low: Informational hygiene issues, optional hardening improvements

## Output Template

```text
Audit Summary
- Scope:
- Date:
- Tools used:
- Constraints:

Findings
1. [Severity] Title
Evidence:
Impact:
Recommendation:
Owner:

Remediation Plan
- Short-term fixes:
- Medium-term fixes:
- Verification steps:
```

## Guardrails

- Prefer read-only commands and non-destructive checks
- Avoid running heavy scanners on the VPS if it risks stability
- Do not print or log secrets in outputs; redact values
