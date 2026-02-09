QA Assignment – Buggy MERN App

This repository contains a QA evaluation of a deliberately buggy full-stack application built with Node.js, Express, MongoDB, JWT authentication, and role-based access control (RBAC).

The purpose of this assignment is to:
- Identify and document defects
- Define a test strategy and test cases
- Implement automated API tests
- Provide a QA report with findings and recommendations

Due to multiple setup and build issues in the project, testing focuses primarily on the backend API.

Tech Stack
- Backend: Node.js, Express, TypeScript
- Database: MongoDB (Mongoose)
- Auth: JWT + Refresh Token
- Testing: Vitest, Supertest
- Environment: GitHub Codespaces

Setup Instructions

1) Install dependencies:
npm install --legacy-peer-deps

2) Start the backend API:
npm run dev

You should see:
[MongoDB] Connected successfully
Server running on port 3001

3) Verify the API:
curl http://localhost:3001/api/cache-status
curl http://localhost:3001/api/items

Running Tests:
NODE_ENV=test npx vitest run -c vitest.workspace.config.ts

Documentation Files:
- TEST_STRATEGY.md
- TESTCASES.md
- REPORT.md

Conclusion:
This repository demonstrates a QA-focused evaluation of a deliberately buggy backend system with documented defects and automated tests.
