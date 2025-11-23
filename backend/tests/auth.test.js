const request = require("supertest");
const app = require("../server");
const User = require("../models/User");

let server;

beforeAll(async () => {
  server = app.listen(0);
  await User.deleteMany({});
});
afterAll(async () => {
  await require("mongoose").disconnect();
  server.close();
});

describe("Auth", () => {
  const user = {
    firstName: "Alex",
    lastName: "River",
    username: "alexriver",
    email: "alex@example.com",
    password: "secure123",
    phone: "5551234567",
    address: "789 Oak Lane",
  };

  test("Register → success", async () => {
    const res = await request(app).post("/auth/register").send(user);
    expect(res.status).toBe(201);
    expect(res.body.email).toBe("alex@example.com");
    expect(res.body.fullName).toBe("Alex River");
  });

  test("Register → duplicate", async () => {
    const res = await request(app).post("/auth/register").send(user);
    expect(res.status).toBe(400);
  });

  test("Login → success", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "alex@example.com", password: "secure123" });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
  });
});
