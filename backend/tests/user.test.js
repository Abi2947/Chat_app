// tests/user.test.js
const request = require("supertest");
const app = require("../server");
const User = require("../models/User");

let token, userId;

beforeAll(async () => {
  await User.deleteMany({});
  const res = await request(app).post("/auth/register").send({
    firstName: "Admin",
    lastName: "User",
    username: "admin",
    email: "admin@test.com",
    password: "admin123",
    phone: "9998887777",
    address: "New York",
  });
  token = res.body.accessToken;
  userId = res.body._id;
  await User.findByIdAndUpdate(userId, { role: "admin" });
});

let server;
beforeAll(() => {
  server = app.listen(0);
});
afterAll(() => server.close());

test("GET /users/dashboard", async () => {
  const res = await request(app)
    .get("/users/dashboard")
    .set("Authorization", `Bearer ${token}`);
  expect(res.status).toBe(200);
  expect(res.body.totalUsers).toBe(1);
});

test("GET /users → list all", async () => {
  const res = await request(app)
    .get("/users")
    .set("Authorization", `Bearer ${token}`);
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body[0].username).toBe("admin");
});
