import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../server/index";

describe("Auth Refresh Token", () => {
  const user = {
    email: `refresh_${Date.now()}@example.com`,
    password: "Password123!",
  };

  it("Can refresh access token using refresh token", async () => {
    await request(app).post("/api/auth/signup").send(user);
    const loginRes = await request(app).post("/api/auth/login").send(user);

    const refreshToken = loginRes.body.refreshToken;
    expect(refreshToken).toBeDefined();

    const refreshRes = await request(app)
      .post("/api/auth/refresh")
      .send({ refreshToken });

    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body).toHaveProperty("accessToken");
  });
});
