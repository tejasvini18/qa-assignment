# QA Assignment – Buggy MERN App

This repository contains a QA evaluation of a deliberately buggy full-stack application built with Node.js, Express, MongoDB, JWT authentication, and role-based access control (RBAC).

The goal of this assignment is to:
- Identify and document defects
- Define a test strategy and test cases
- Implement automated API tests
- Provide a QA report with findings and recommendations

Due to multiple setup and build issues in the project, testing focuses primarily on the backend API.

---

## Tech Stack

- Backend: Node.js, Express, TypeScript
- Database: MongoDB (Mongoose)
- Auth: JWT + Refresh Token
- Testing: Vitest, Supertest
- Environment: GitHub Codespaces

---

## Setup Instructions

### 1) Install dependencies

```bash
npm install --legacy-peer-deps
```

### 2) Start the backend API

```bash
npm run dev
```

You should see:

```
[MongoDB] Connected successfully
Server running on port 3001
```

### 3) Verify API

```bash
curl http://localhost:3001/api/cache-status
curl http://localhost:3001/api/items
```

---

## Running Automated Tests

```bash
NODE_ENV=test npx vitest run -c vitest.workspace.config.ts
```

This runs:
- Smoke tests
- Auth E2E journey test
- RBAC tests
- Editor/Admin CRUD tests
- Refresh token test
- File upload test

Some tests intentionally fail because they expose real defects in the application.

---

## Documentation Files

- TEST_STRATEGY.md – Test approach and scope
- TESTCASES.md – 50 manual test cases
- REPORT.md – Test summary, bugs, and recommendations
- BUG_REPORTS_QA.md – Detailed bug reports

---

## Conclusion

This repository demonstrates a full QA process including:
- Test strategy
- Manual test cases
- Bug reporting
- Automated API testing
- Test reporting and recommendations
