Bug Reports – Buggy MERN App
Server crashes with EADDRINUSE when port 3001 is already in use
Severity: High
Priority: High
Steps to Reproduce:
1.	1. Start the backend using `npm run dev`.
2.	2. In another terminal, start the backend again using `npm run dev`.
3.	3. Observe the second process output.
Expected Result:
The server should detect the port is already in use and show a friendly error or retry with another port.
Actual Result:
The server crashes with `EADDRINUSE: address already in use :::3001` and exits.
Notes / Possible Root Cause:
The server starts listening during import and does not handle port conflicts gracefully.
Frontend not accessible because client/dist is missing
Severity: High
Priority: High
Steps to Reproduce:
4.	1. Start the backend using `npm run dev`.
5.	2. Open browser and navigate to `http://localhost:3001/`.
6.	3. Observe the response.
Expected Result:
The frontend UI should load or a clear message should explain how to build it.
Actual Result:
The server responds with 'Cannot GET /' because `client/dist` does not exist.
Notes / Possible Root Cause:
Express is configured to serve `client/dist`, but no build step generates it.
Broken shipped test fails due to missing module import
Severity: High
Priority: Medium
Steps to Reproduce:
7.	1. Run `npx vitest run` using the default configuration.
8.	2. Observe the test execution.
Expected Result:
All included tests should run or be skipped gracefully.
Actual Result:
Test `server/auth.logout.test.ts` fails due to missing import `./notification` in `server/_core/systemRouter.ts`.
Notes / Possible Root Cause:
The repository contains a test that references a non-existent module, breaking the test suite.
Unsafe CORS configuration allows wildcard origin with credentials
Severity: High (Security)
Priority: High
Steps to Reproduce:
9.	1. Inspect CORS configuration in `server/index.ts`.
10.	2. Note the values for `origin` and `credentials`.
Expected Result:
CORS should restrict origins when credentials are enabled.
Actual Result:
CORS is configured with `origin: "*"` and `credentials: true`, which is unsafe.
Notes / Possible Root Cause:
This can allow credentialed requests from any origin and should be restricted.
