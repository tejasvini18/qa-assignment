# Test Strategy – buggy-mern-app

## Objective
Validate the core backend capabilities of the application and identify defects across:
- Authentication (JWT + refresh)
- Role-based access (user/editor/admin)
- Items CRUD + file upload
- API contracts, error handling, rate limiting
- Security and reliability risks

## Scope
### In scope
- API routes:
  - POST /api/auth/signup
  - POST /api/auth/login
  - POST /api/auth/refresh
  - GET /api/items
  - GET /api/items/:id
  - POST /api/items (Editor/Admin)
  - PUT /api/items/:id (Editor/Admin)
  - DELETE /api/items/:id (expected RBAC)
  - POST /api/items/:id/upload (Editor/Admin)
  - GET /api/cache-status
- AuthZ: guest vs user vs editor vs admin
- Input validation and negative testing (bad payloads, invalid IDs)
- Regression scenarios (breaking changes, install/run issues)
- Basic security checks (CORS, auth bypass attempts, file upload constraints)
- Basic performance checks (response time on list endpoints)

### Out of scope (current environment)
- Full UI E2E (frontend build not reliably available due to missing client build artifacts and setup issues)

## Approach
### Manual testing
- Validate endpoints using browser/curl
- Verify status codes, response shape, pagination, error messages
- Exercise role-based access rules

### Automation
- Unit tests (where possible): helpers, middleware behavior
- Integration tests: API routes + MongoDB
- E2E (API journey) tests:
  - Signup → Login → Create Item → Update Item → Delete Item
  - Refresh token behavior

## Test Data
- Create test users: user/editor/admin
- Seed items during tests and clean up after tests

## Risks / Known Issues
- Project setup defects: dependency conflicts requiring `--legacy-peer-deps`
- Docker build defects related to pnpm lockfile
- Frontend not accessible / missing build output
- Port forwarding instability in Codespaces (use localhost curl for verification)

## Exit Criteria
- 40–50 test cases documented
- Bugs reported with repro steps and expected vs actual
- Automated test suite runs successfully with clear instructions in README
