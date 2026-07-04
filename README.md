# Azure CI/CD Platform

A production-style CI/CD pipeline built with GitHub Actions, deploying a containerized Next.js application to Azure Container Apps — featuring OIDC secretless authentication, image promotion, gated production releases, and automated rollback.

**Live Demo**: [Staging](https://app-staging.blackgrass-7073786c.eastus.azurecontainerapps.io/) · [Production](https://app-production.blackgrass-7073786c.eastus.azurecontainerapps.io/)

---

## Pipeline Architecture

```
                    ┌─────────────────────────────────────────┐
                    │              Pull Request                │
                    │  Lint → Test → Coverage → npm audit     │
                    │  Docker build check → Trivy image scan  │
                    └──────────────────┬──────────────────────┘
                                       │ merge to main
                    ┌──────────────────▼──────────────────────┐
                    │            Staging Pipeline              │
                    │  Build image → Push to GHCR (sha-tag)   │
                    │  Deploy to Azure Container Apps          │
                    │  Smoke test → Auto-rollback on failure  │
                    └──────────────────┬──────────────────────┘
                                       │ git tag v*.*.*
                    ┌──────────────────▼──────────────────────┐
                    │           Production Pipeline            │
                    │  Promote staging-verified image (retag)  │
                    │  ⏸ Manual approval gate                  │
                    │  Deploy → Smoke test                      │
                    └───────────────────────────────────────────┘
```

## What This Project Demonstrates

| Area | Implementation |
|------|---------------|
| **CI** | ESLint · Jest with coverage · npm audit · Trivy vulnerability scan |
| **Docker** | Multi-stage build · Immutable SHA-tagged images · GHCR |
| **CD — Staging** | Auto-deploy on merge to `main` · Smoke test · Auto-rollback |
| **CD — Production** | Tag-triggered · Manual approval via GitHub Environments · Image promotion (retag, not rebuild) |
| **Security** | OIDC secretless auth · Least-privilege workflow permissions · Dependabot · Branch protection |
| **Reusability** | Reusable workflows (`workflow_call`) for test and Docker build stages |

## Key Design Decisions

### 1. OIDC instead of stored credentials

GitHub Actions authenticates to Azure using short-lived OIDC tokens via federated identity credentials. **No long-lived secrets exist anywhere in this repository** — the three values in GitHub Secrets (client/tenant/subscription IDs) are public identifiers, not credentials.

### 2. Build once, deploy many

Production releases **promote** the exact image verified in staging by retagging it in the registry (`docker buildx imagetools create`) — never rebuilding. The tested artifact is byte-identical to the released artifact. A side effect: any commit that never passed through staging physically cannot reach production.

### 3. Immutable image tags

Every deployment references `sha-<full-commit-sha>` or a semver tag — never `latest`. Any running container can be traced back to its exact source commit, and rollback is a one-command redeploy of the previous tag.

### 4. Least-privilege permissions

Each workflow declares only the permissions it needs (`contents: read`, `packages: write`, `id-token: write`). The default token permissions are never relied upon.

## Rollback Strategy

Staging deployments include an automated rollback: if the post-deploy smoke test against `/api/health` fails, the pipeline redeploys the previous revision's image automatically. For production, rollback is performed by redeploying the previous immutable tag.

## Repository Structure

```
├── app/                        # Next.js application (App Router)
├── __tests__/                  # Jest unit tests
├── Dockerfile                  # Multi-stage build (deps → build → slim runner)
├── .github/
│   ├── dependabot.yml          # Weekly dependency updates (major versions ignored)
│   └── workflows/
│       ├── ci.yml              # PR quality gate
│       ├── reusable-test.yml   # Shared: lint + test + audit
│       ├── reusable-docker.yml # Shared: build + push with SHA tagging
│       ├── deploy-staging.yml  # main → staging with smoke test + rollback
│       └── deploy-production.yml # tag → promote + approval + deploy
```

## Run Locally

```bash
npm install
npm run dev          # http://localhost:3000

# Or with Docker
docker build -t cicd-demo .
docker run -p 3000:3000 cicd-demo
```
