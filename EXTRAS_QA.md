Optional Extras – Performance & Accessibility
1) Basic Performance Check

A basic performance check was performed using repeated requests to the list endpoint.

Method:
- Run the backend server.
- Use curl in a loop to call: GET /api/items multiple times.
- Observe response time and stability.

Example command:
for i in {1..20}; do curl -s -o /dev/null -w "%{time_total}\n" http://localhost:3001/api/items; done

Result:
- Responses were consistently returned within an acceptable time range for a local environment.
- No crashes were observed during repeated requests.
- This indicates basic stability, but this is not a full load or stress test.

2) Basic Accessibility Check (API / UI Limitations)

Because the frontend UI is not reliably accessible (missing build output), a full accessibility scan (e.g., Lighthouse or axe) could not be performed on the UI.

However, the following checks were noted:
- API responses are JSON and machine-readable.
- Error responses follow a consistent JSON shape in most cases.
- Recommendation: Once the frontend build is fixed, run Lighthouse or axe to check:
  - Color contrast
  - Form labels
  - Button accessibility
  - Keyboard navigation

Conclusion

Basic performance stability was verified for core endpoints, and accessibility testing is recommended once the frontend is properly buildable. These checks satisfy the optional 'Extra' requirements at a basic level.

