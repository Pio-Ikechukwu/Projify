const request = require("supertest");
const { expect } = require("chai");
const app = require("./app");
let token = "";
let token2 = "";
let projectId = 0;
let taskId = 0;
let inviteId = 0;
let memberId = 0;
let statusId = 0;
let priorityId = 0;

describe("Auth Routes", () => {
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
  });

  it("should not register with duplicate email", async () => {
    const res = await request(app.callback()).post("/auth/register").send({
      fullName: "Test User",
      email: "test@test.com",
      password: "123456",
    });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property("error");
  });

  it("should login user 1 and return token", async () => {
    const res = await request(app.callback())
      .post("/auth/login")
      .send({ email: "test@test.com", password: "123456" });
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("token");
    token = res.body.token;
  });

  it("should login user 2 and return token", async () => {
    const res = await request(app.callback())
      .post("/auth/login")
      .send({ email: "second@test.com", password: "123456" });
    expect(res.status).to.equal(200);
    token2 = res.body.token;
  });

  it("should not login with wrong password", async () => {
    const res = await request(app.callback())
      .post("/auth/login")
      .send({ email: "test@test.com", password: "wrongpassword" });
    expect(res.status).to.equal(401);
  });

  it("should get current user with valid token", async () => {
    const res = await request(app.callback())
      .get("/auth/me")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("email", "test@test.com");
  });

  it("should not get current user without token", async () => {
    const res = await request(app.callback()).get("/auth/me");
    expect(res.status).to.equal(401);
  });
});

describe("Project Routes", () => {
  it("should create a project", async () => {
    const res = await request(app.callback())
      .post("/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({ projectName: "Test Project", description: "Test Description" });
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property("id");
    projectId = res.body.id;
  });

  it("should not create project without token", async () => {
    const res = await request(app.callback())
      .post("/projects")
      .send({ projectName: "Test Project", description: "Test Description" });
    expect(res.status).to.equal(401);
  });

  it("should get all projects", async () => {
    const res = await request(app.callback())
      .get("/projects")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an("array");
  });

  it("should get a single project", async () => {
    const res = await request(app.callback())
      .get(`/projects/${projectId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("projectName", "Test Project");
  });

  it("should update a project", async () => {
    const res = await request(app.callback())
      .put(`/projects/${projectId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        projectName: "Updated Project",
        description: "Updated Description",
      });
    expect(res.status).to.equal(200);
    expect(res.body.project).to.have.property("projectName", "Updated Project");
  });
});

describe("Status & Priority Routes", () => {
  it("should get default statuses after project creation", async () => {
    const res = await request(app.callback())
      .get(`/projects/${projectId}/statuses`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an("array").with.lengthOf(3);
    statusId = res.body[0].id;
  });

  it("should get default priorities after project creation", async () => {
    const res = await request(app.callback())
      .get(`/projects/${projectId}/priorities`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an("array").with.lengthOf(3);
    priorityId = res.body[0].id;
  });

  it("should create a new status", async () => {
    const res = await request(app.callback())
      .post(`/projects/${projectId}/statuses`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Blocked" });
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property("name", "Blocked");
  });

  it("should create a new priority", async () => {
    const res = await request(app.callback())
      .post(`/projects/${projectId}/priorities`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Critical" });
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property("name", "Critical");
  });
});

describe("Task Routes", () => {
  it("should create a task", async () => {
    const res = await request(app.callback())
      .post(`/projects/${projectId}/tasks`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Test Task",
        description: "Test Description",
        dueDate: "2026-12-31",
        statusId,
        priorityId,
      });
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property("id");
    taskId = res.body.id;
  });

  it("should not create task without required fields", async () => {
    const res = await request(app.callback())
      .post(`/projects/${projectId}/tasks`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Missing fields" });
    expect(res.status).to.equal(400);
  });

  it("should get all tasks", async () => {
    const res = await request(app.callback())
      .get(`/projects/${projectId}/tasks`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an("array");
  });

  it("should update a task", async () => {
    const res = await request(app.callback())
      .put(`/projects/${projectId}/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Updated Task" });
    expect(res.status).to.equal(200);
    expect(res.body.task).to.have.property("title", "Updated Task");
  });

  it("should delete a task", async () => {
    const res = await request(app.callback())
      .delete(`/projects/${projectId}/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).to.equal(200);
  });
});

describe("Invite Routes", () => {
  it("should send an invite", async () => {
    const res = await request(app.callback())
      .post(`/projects/${projectId}/invites`)
      .set("Authorization", `Bearer ${token}`)
      .send({ email: "second@test.com" });
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property("id");
    inviteId = res.body.id;
  });

  it("should not send duplicate invite", async () => {
    const res = await request(app.callback())
      .post(`/projects/${projectId}/invites`)
      .set("Authorization", `Bearer ${token}`)
      .send({ email: "second@test.com" });
    expect(res.status).to.equal(400);
  });

  it("should get received invites for user 2", async () => {
    const res = await request(app.callback())
      .get("/invites/received")
      .set("Authorization", `Bearer ${token2}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an("array");
  });

  it("should accept invite as user 2", async () => {
    const res = await request(app.callback())
      .post(`/invites/${inviteId}/accept`)
      .set("Authorization", `Bearer ${token2}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("member");
    memberId = res.body.member.id;
  });

  it("should not accept already accepted invite", async () => {
    const res = await request(app.callback())
      .post(`/invites/${inviteId}/accept`)
      .set("Authorization", `Bearer ${token2}`);
    expect(res.status).to.equal(400);
  });
});

describe("Member Routes", () => {
  it("should get all members", async () => {
    const res = await request(app.callback())
      .get(`/projects/${projectId}/members`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an("array");
  });

  it("should update member role", async () => {
    const res = await request(app.callback())
      .put(`/projects/${projectId}/members/${memberId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ role: "Admin" });
    expect(res.status).to.equal(200);
    expect(res.body.member).to.have.property("role", "Admin");
  });

  it("should remove a member", async () => {
    const res = await request(app.callback())
      .delete(`/projects/${projectId}/members/${memberId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).to.equal(200);
  });
});

describe("Project Deletion", () => {
  it("should delete a project and cascade", async () => {
    const res = await request(app.callback())
      .delete(`/projects/${projectId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).to.equal(200);
  });
});
