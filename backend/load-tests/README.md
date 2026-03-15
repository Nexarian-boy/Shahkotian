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

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Feature matrix tuning:

- `MATRIX_RPS` (default `25`)
- `MATRIX_DURATION` (default `5m`)
- `MATRIX_PRE_VUS` (default `120`)
- `MATRIX_MAX_VUS` (default `600`)

## Recommended run order

```powershell
cd backend
node scripts/load-testing/create-test-users.js
node scripts/load-testing/test-db-rotation.js
node scripts/load-testing/test-cloudinary.js
k6 run load-tests/main-load-test.js
k6 run load-tests/feature-matrix-load-test.js
node scripts/load-testing/cleanup-test-users.js
```

## Notes

- The matrix script intentionally treats some write responses (`400`, `404`) as acceptable for synthetic payload checks.
- `main-load-test.js` writes chat messages to exercise write pressure; run cleanup afterwards if desired.
- Admin-only status checks are skipped if admin credentials are not provided.
