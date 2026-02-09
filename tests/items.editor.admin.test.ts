import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../server/index";

let editorToken: string;
let adminToken: string;
let createdItemId: string;

const editorUser = {
  email: `editor_${Date.now()}@example.com`,
  password: "Password123!",
};

const adminUser = {
  email: `admin_${Date.now()}@example.com`,
  password: "Password123!",
};

describe("Editor/Admin Item Management", () => {
  beforeAll(async () => {
    // Signup editor
    await request(app).post("/api/auth/signup").send(editorUser);
    const editorLogin = await request(app).post("/api/auth/login").send(editorUser);
    editorToken = editorLogin.body.accessToken;

    // Signup admin
    await request(app).post("/api/auth/signup").send(adminUser);
    const adminLogin = await request(app).post("/api/auth/login").send(adminUser);
    adminToken = adminLogin.body.accessToken;
  });

  it("Editor can create item", async () => {
    const res = await request(app)
      .post("/api/items")
      .set("Authorization", `Bearer ${editorToken}`)
      .send({ title: "Test Item", description: "Test Desc" });

    expect([200, 201]).toContain(res.status);
    expect(res.body).toHaveProperty("data");
    createdItemId = res.body.data._id;
  });

  it("Editor can update item", async () => {
    const res = await request(app)
      .put(`/api/items/${createdItemId}`)
      .set("Authorization", `Bearer ${editorToken}`)
      .send({ title: "Updated Title" });

    expect(res.status).toBe(200);
  });

  it("Admin can delete item", async () => {
    const res = await request(app)
      .delete(`/api/items/${createdItemId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect([200, 204]).toContain(res.status);
  });
});
