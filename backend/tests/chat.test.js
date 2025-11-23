// // tests/chat.test.js
// const request = require("supertest");
// const app = require("../server");
// const User = require("../models/User");
// const Chat = require("../models/Chat");

// let token1, user1Id, user2Id, chatId;

// beforeAll(async () => {
//   await User.deleteMany({});
//   await Chat.deleteMany({});

//   // USER 1
//   const r1 = await request(app).post("/auth/register").send({
//     firstName: "A",
//     lastName: "One",
//     username: "alice1",
//     email: "a@chat.com",
//     password: "password123",
//     phone: "1112223333",
//     address: "123 A St",
//   });

//   console.log(
//     "Register User 1:",
//     r1.status,
//     r1.body.accessToken ? "OK" : "NO TOKEN"
//   );

//   if (r1.status !== 201 || !r1.body.accessToken) {
//     throw new Error("User 1 failed: " + JSON.stringify(r1.body));
//   }
//   token1 = r1.body.accessToken;
//   user1Id = r1.body._id;

//   // USER 2
//   const r2 = await request(app).post("/auth/register").send({
//     firstName: "B",
//     lastName: "Two",
//     username: "bob22",
//     email: "b@chat.com",
//     password: "secure456",
//     phone: "4445556666",
//     address: "456 B Ave",
//   });

//   if (r2.status !== 201 || !r2.body.accessToken) {
//     throw new Error("User 2 failed: " + JSON.stringify(r2.body));
//   }

//   user2Id = r2.body._id; // THIS LINE WAS MISSING

//   // CREATE CHAT
//   const chatRes = await request(app)
//     .post("/chat/create")
//     .set("Authorization", `Bearer ${token1}`)
//     .send({ recipientId: user2Id });

//   console.log(
//     "Chat created:",
//     chatRes.status,
//     chatRes.body._id || chatRes.body
//   );

//   if (chatRes.status !== 200 && chatRes.status !== 201) {
//     throw new Error("Chat failed: " + JSON.stringify(chatRes.body));
//   }

//   chatId = chatRes.body._id;
// });

// test("GET /chat/ → list chats", async () => {
//   const res = await request(app)
//     .get("/chat/")
//     .set("Authorization", `Bearer ${token1}`);
//   expect(res.status).toBe(200);
//   expect(Array.isArray(res.body)).toBe(true);
//   expect(res.body.length).toBeGreaterThan(0);
// });

// test("GET /chat/:id/messages → empty", async () => {
//   const res = await request(app)
//     .get(`/chat/${chatId}/messages`)
//     .set("Authorization", `Bearer ${token1}`);
//   expect(res.status).toBe(200);
//   expect(res.body).toHaveLength(0);
// });

// tests/chat.test.js
const request = require("supertest");
const app = require("../server");
const User = require("../models/User");
const Chat = require("../models/Chat");

let token1, token2, user1Id, user2Id, chatId;

beforeAll(async () => {
  await User.deleteMany({});
  await Chat.deleteMany({});

  // USER 1
  const r1 = await request(app).post("/auth/register").send({
    firstName: "A",
    lastName: "One",
    username: "alice1",
    email: "a@chat.com",
    password: "password123",
    phone: "1112223333",
    address: "123 A St",
  });

  console.log(
    "Register User 1:",
    r1.status,
    r1.body.accessToken ? "OK" : "NO TOKEN"
  );

  if (r1.status !== 201 || !r1.body.accessToken) {
    throw new Error("User 1 failed: " + JSON.stringify(r1.body));
  }
  token1 = r1.body.accessToken;
  user1Id = r1.body._id;

  // USER 2
  const r2 = await request(app).post("/auth/register").send({
    firstName: "B",
    lastName: "Two",
    username: "bob22",
    email: "b@chat.com",
    password: "secure456",
    phone: "4445556666",
    address: "456 B Ave",
  });

  if (r2.status !== 201 || !r2.body.accessToken) {
    throw new Error("User 2 failed: " + JSON.stringify(r2.body));
  }

  token2 = r2.body.accessToken;
  user2Id = r2.body._id;

  // CREATE CHAT
  const chatRes = await request(app)
    .post("/chat/create")
    .set("Authorization", `Bearer ${token1}`)
    .send({ recipientId: user2Id });

  console.log(
    "Chat created:",
    chatRes.status,
    chatRes.body._id || chatRes.body
  );

  if (chatRes.status !== 200 && chatRes.status !== 201) {
    throw new Error("Chat failed: " + JSON.stringify(chatRes.body));
  }

  chatId = chatRes.body._id;
});

test("GET /chat/ → list chats", async () => {
  const res = await request(app)
    .get("/chat/")
    .set("Authorization", `Bearer ${token1}`);
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body.length).toBeGreaterThan(0);
});

test("GET /chat/:id/messages → empty", async () => {
  const res = await request(app)
    .get(`/chat/${chatId}/messages`)
    .set("Authorization", `Bearer ${token1}`);
  expect(res.status).toBe(200);
  expect(res.body).toHaveLength(0);
});
