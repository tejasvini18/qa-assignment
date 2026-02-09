import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../server/index";

const rand = () => Math.random().toString(16).slice(2);

describe("Auth + Items Journey (API E2E)", () => {
  it("Signup -> Login -> GET /api/items", async () => {
    const email = `qa_${rand()}@example.com`;
    const password = "Password123!";

    const signup = await request(app)
      .post("/api/auth/signup")
      .send({ name: "QA User", email, password });

    expect([200, 201]).toContain(signup.status);

    const login = await request(app)
      .post("/api/auth/login")
      .send({ email, password });

    expect(login.status).toBe(200);

    const items = await request(app).get("/api/items");
    expect(items.status).toBe(200);
    expect(items.body).toHaveProperty("data");
    expect(items.body).toHaveProperty("pagination");
  });
});
