const request = require("supertest");
const { expect } = require("chai");
const app = require("../app");
const {
  cleanDB,
  loginUser,
  createProject,
  getStatuses,
  getPriorities,
} = require("./helpers");

describe("Task Routes", () => {
  let token;
  let projectId;
  let taskId;
  let statusId;
  let priorityId;

  before(async () => {
    await cleanDB();
    await request(app.callback()).post("/auth/register").send({
      fullName: "Test User",
      email: "test@test.com",
      password: "123456",
    });
    token = await loginUser("test@test.com", "123456");
    const project = await createProject(
      token,
      "Test Project",
      "Test Description",
    );
    projectId = project.id;
    const statuses = await getStatuses(token, projectId);
    const priorities = await getPriorities(token, projectId);
    statusId = statuses[0].id;
    priorityId = priorities[0].id;
  });

  after(async () => await cleanDB());

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
    expect(res.body).to.have.property("title", "Test Task");
    taskId = res.body.id;

    // verify it's in the array
    const allRes = await request(app.callback())
      .get(`/projects/${projectId}/tasks`)
      .set("Authorization", `Bearer ${token}`);
    expect(allRes.body).to.be.an("array");
    expect(allRes.body.length).to.be.greaterThan(0);
    const created = allRes.body.find((t) => t.id === taskId);
    expect(created).to.have.property("title", "Test Task");
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
    expect(res.body.length).to.be.greaterThan(0);
    expect(res.body[0]).to.have.property("id");
    expect(res.body[0]).to.have.property("title");
    expect(res.body[0]).to.have.property("status");
    expect(res.body[0]).to.have.property("priority");
  });

  it("should update a task", async () => {
    const res = await request(app.callback())
      .put(`/projects/${projectId}/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Updated Task" });
    expect(res.status).to.equal(200);
    expect(res.body.task).to.have.property("title", "Updated Task");

    // verify update is in the array
    const allRes = await request(app.callback())
      .get(`/projects/${projectId}/tasks`)
      .set("Authorization", `Bearer ${token}`);
    const updated = allRes.body.find((t) => t.id === taskId);
    expect(updated).to.have.property("title", "Updated Task");
  });

  it("should delete a task", async () => {
    const res = await request(app.callback())
      .delete(`/projects/${projectId}/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).to.equal(200);

    // verify it's gone from the array
    const allRes = await request(app.callback())
      .get(`/projects/${projectId}/tasks`)
      .set("Authorization", `Bearer ${token}`);
    const deleted = allRes.body.find((t) => t.id === taskId);
    expect(deleted).to.be.undefined;
  });
});
