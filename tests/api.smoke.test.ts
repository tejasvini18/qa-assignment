import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../server/index";

describe("API smoke", () => {
  it("GET /api/cache-status returns json", async () => {
    const res = await request(app).get("/api/cache-status");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("cacheSize");
    expect(res.body).toHaveProperty("entries");
  });

  it("GET /api/items returns data + pagination", async () => {
    const res = await request(app).get("/api/items");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(res.body).toHaveProperty("pagination");
  });
});
