import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../server/index";

const rand = () => Math.random().toString(16).slice(2);

describe("RBAC - Items", () => {
  it("Normal user cannot create item (should be 401/403 depending on token)", async () => {
    const email = `qa_${rand()}@example.com`;
    const password = "Password123!";

    await request(app)
      .post("/api/auth/signup")
      .send({ name: "QA User", email, password });

    const login = await request(app)
      .post("/api/auth/login")
      .send({ email, password });

    expect(login.status).toBe(200);

    const token =
      login.body?.accessToken || login.body?.token || login.body?.access || null;

    const req = request(app).post("/api/items").send({
      title: "RBAC Test Item",
      description: "Attempt create as normal user",
    });

    const res = token
      ? await req.set("Authorization", `Bearer ${token}`)
      : await req;

    // Expected: forbidden for non-editor/admin
    expect([401, 403]).toContain(res.status);
  });
});
