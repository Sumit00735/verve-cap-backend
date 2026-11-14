# Verve Cap API

NestJS (Fastify) backend for the due-diligence and deal-room platform. Program docs live in the separate `pr` workspace.

## Setup

```bash
pnpm install
cp .env.example .env
docker compose up -d
pnpm prisma generate
pnpm start:dev
```

## Checks

```bash
pnpm lint
pnpm test
pnpm test:e2e
pnpm build
curl http://127.0.0.1:3001/health
curl http://127.0.0.1:3001/ready
```

## Branches

- `main` — production releases (protected)
- `develop` — integration (protected)
- `feature/<phase>-<area>-<name>` — one feature per branch

Foundation branch: `chore/p0-foundation`.