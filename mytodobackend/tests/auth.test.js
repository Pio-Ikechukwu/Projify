const request = require("supertest");
const { expect } = require("chai");
const app = require("../app");
const { cleanDB, loginUser } = require("./helpers");

describe("Auth Routes", () => {
  before(async () => await cleanDB());
  after(async () => await cleanDB());

  it("should register user 1", async () => {
    const res = await request(app.callback()).post("/auth/register").send({
      fullName: "Test User",
      email: "test@test.com",
      password: "123456",
    });
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property("userId");
  });

  it("should register user 2", async () => {
    const res = await request(app.callback()).post("/auth/register").send({
      fullName: "Second User",
      email: "second@test.com",
      password: "123456",
    });
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property("userId");
  });

  it("should not register with duplicate email", async () => {
    const res = await request(app.callback()).post("/auth/register").send({
      fullName: "Test User",
      email: "test@test.com",
      password: "123456",
    });
    expect(res.status).to.equal(409);
    expect(res.body).to.have.property("error");
  });

  it("should login user 1 and return token", async () => {
    const res = await request(app.callback())
      .post("/auth/login")
      .send({ email: "test@test.com", password: "123456" });
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("token");
  });

  it("should login user 2 and return token", async () => {
    const res = await request(app.callback())
      .post("/auth/login")
      .send({ email: "second@test.com", password: "123456" });
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("token");
  });

  it("should not login with wrong password", async () => {
    const res = await request(app.callback())
      .post("/auth/login")
      .send({ email: "test@test.com", password: "wrongpassword" });
    expect(res.status).to.equal(401);
  });

  it("should get current user with valid token", async () => {
    const token = await loginUser("test@test.com", "123456");
    const res = await request(app.callback())
      .get("/auth/me")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("email", "test@test.com");
    expect(res.body).to.have.property("fullName", "Test User");
    expect(res.body).to.have.property("id");
  });

  it("should not get current user without token", async () => {
    const res = await request(app.callback()).get("/auth/me");
    expect(res.status).to.equal(401);
  });
});
