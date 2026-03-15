# Load Testing Toolkit

This folder contains k6 scripts and helper Node scripts to stress-test Shahkot backend functionality.

## What this suite covers

- 500-user ramp login and core feature flow
- High-volume reads across key modules (listings, news, jobs, notifications, chat, bazar, doctors, restaurants, cloth brands, blood)
- Write-path pressure for chat endpoints
- Optional admin-only checks for DB rotation and Cloudinary rotation status endpoints
- Test user seeding and cleanup scripts

## Files

- `load-tests/main-load-test.js`: Primary 500-user ramp test
- `load-tests/feature-matrix-load-test.js`: Broader feature matrix load test
- `scripts/load-testing/create-test-users.js`: Create synthetic users
- `scripts/load-testing/test-db-rotation.js`: Validate DB manager status + write behavior
- `scripts/load-testing/test-cloudinary.js`: Validate Cloudinary manager status
- `scripts/load-testing/cleanup-test-users.js`: Remove synthetic users and related data

`create-test-users.js` and `cleanup-test-users.js` now use a direct Prisma client (`DATABASE_URL`) and do not import `src/config/database`, so they do not start DB manager timers.

## Prerequisites

- Backend env configured and reachable (local or deployed)
- k6 installed
- Seed users created before running k6

Windows install (k6):

```powershell
winget install k6 --source winget
```

## Environment variables

Set these before running tests (or define in shell):

- `BASE_URL` (default: `http://localhost:8080/api`)
- `TEST_USER_COUNT` (default: `500`)
- `TEST_USER_PASSWORD` (default: `Test@12345`)
- `TEST_USER_EMAIL_DOMAIN` (default: `shahkot-test.com`)
- `TEST_LAT` / `TEST_LNG` for geofence-aware login

Optional admin checks (for `/api/db-status`, `/api/cloudinary-status`):

- `ADMIN_TOKEN` (recommended)
- `ADMIN_EMAIL` + `ADMIN_PASSWORD` (optional fallback for k6 admin checks)

If `ADMIN_TOKEN` is not set, `run-all-load-tests.ps1` now auto-generates one from the first active ADMIN user using `JWT_SECRET` and `DATABASE_URL`.

Feature matrix tuning:

- `MATRIX_RPS` (default `25`)
- `MATRIX_DURATION` (default `5m`)
- `MATRIX_PRE_VUS` (default `120`)
- `MATRIX_MAX_VUS` (default `600`)

## Recommended run order

```powershell
cd backend
$env:BASE_URL="https://lionfish-app-tkr7y.ondigitalocean.app/api"
$env:ADMIN_TOKEN="<admin_jwt_here>"
node scripts/load-testing/create-test-users.js
node scripts/load-testing/test-db-rotation.js
node scripts/load-testing/test-cloudinary.js
k6 run load-tests/main-load-test.js
k6 run load-tests/feature-matrix-load-test.js
node scripts/load-testing/cleanup-test-users.js
```

## One-click runner (recommended)

Run everything with one command and save timestamped logs/reports:

```powershell
cd backend
npm run loadtest:run:all
```

Advanced options (skip stages if needed):

```powershell
cd backend
powershell -ExecutionPolicy Bypass -File scripts/load-testing/run-all-load-tests.ps1 -SkipCleanup
powershell -ExecutionPolicy Bypass -File scripts/load-testing/run-all-load-tests.ps1 -SkipCreateUsers -SkipRotationChecks
```

Run only remote rotation checks:

```powershell
cd backend
$env:BASE_URL="https://lionfish-app-tkr7y.ondigitalocean.app/api"
$env:ADMIN_TOKEN="<admin_jwt_here>"
node scripts/load-testing/test-db-rotation.js
node scripts/load-testing/test-cloudinary.js
```

Output location:

- `backend/load-tests/results/<timestamp>/`
- Contains per-step logs + `main-summary.json` + `matrix-summary.json`

## Notes

- The matrix script intentionally treats some write responses (`400`, `404`) as acceptable for synthetic payload checks.
- `main-load-test.js` writes chat messages to exercise write pressure; run cleanup afterwards if desired.
- Admin-only status checks require `ADMIN_TOKEN` (or credentials fallback in k6).

## Undo / rollback

If you only want to undo test data (recommended):

```powershell
cd backend
npm run loadtest:users:cleanup
```

If you also want to remove the load-testing toolkit code itself:

1. Remove folder `backend/load-tests/`
2. Remove folder `backend/scripts/load-testing/`
3. Remove these script entries from `backend/package.json`:
	- `loadtest:users:create`
	- `loadtest:db`
	- `loadtest:cloudinary`
	- `loadtest:k6:main`
	- `loadtest:k6:matrix`
	- `loadtest:users:cleanup`
	- `loadtest:run:all`
