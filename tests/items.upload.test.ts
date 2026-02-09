import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../server/index";
import fs from "fs";

let editorToken: string;
let itemId: string;

const editorUser = {
  email: `upload_${Date.now()}@example.com`,
  password: "Password123!",
};

describe("Item File Upload", () => {
  beforeAll(async () => {
    await request(app).post("/api/auth/signup").send(editorUser);
    const loginRes = await request(app).post("/api/auth/login").send(editorUser);
    editorToken = loginRes.body.accessToken;

    const itemRes = await request(app)
      .post("/api/items")
      .set("Authorization", `Bearer ${editorToken}`)
      .send({ title: "Upload Item", description: "Upload test" });

    itemId = itemRes.body.data._id;

    fs.writeFileSync("test-upload.txt", "hello");
  });

  it("Editor can upload file to item", async () => {
    const res = await request(app)
      .post(`/api/items/${itemId}/upload`)
      .set("Authorization", `Bearer ${editorToken}`)
      .attach("file", "test-upload.txt");

    expect(res.status).toBe(200);
  });
});
