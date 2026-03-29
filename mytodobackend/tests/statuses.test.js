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

describe("Status & Priority Routes", () => {
  let token;
  let projectId;

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
  });

  after(async () => await cleanDB());

  it("should get default statuses after project creation", async () => {
    const res = await request(app.callback())
      .get(`/projects/${projectId}/statuses`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an("array").with.lengthOf(3);
    expect(res.body[0]).to.have.property("id");
    expect(res.body[0]).to.have.property("name");
    expect(res.body[0]).to.have.property("projectId", projectId);
  });

  it("should get default priorities after project creation", async () => {
    const res = await request(app.callback())
      .get(`/projects/${projectId}/priorities`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an("array").with.lengthOf(3);
    expect(res.body[0]).to.have.property("id");
    expect(res.body[0]).to.have.property("name");
    expect(res.body[0]).to.have.property("projectId", projectId);
  });

  it("should create a new status", async () => {
    const res = await request(app.callback())
      .post(`/projects/${projectId}/statuses`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Blocked" });
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property("name", "Blocked");

    // verify it's in the array
    const allStatuses = await getStatuses(token, projectId);
    const created = allStatuses.find((s) => s.name === "Blocked");
    expect(created).to.exist;
    expect(created).to.have.property("name", "Blocked");
  });

  it("should create a new priority", async () => {
    const res = await request(app.callback())
      .post(`/projects/${projectId}/priorities`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Critical" });
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property("name", "Critical");

    // verify it's in the array
    const allPriorities = await getPriorities(token, projectId);
    const created = allPriorities.find((p) => p.name === "Critical");
    expect(created).to.exist;
    expect(created).to.have.property("name", "Critical");
  });

  it("should update a status", async () => {
    const statuses = await getStatuses(token, projectId);
    const statusId = statuses[0].id;
    const res = await request(app.callback())
      .put(`/projects/${projectId}/statuses/${statusId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Updated Status" });
    expect(res.status).to.equal(200);
    expect(res.body.status).to.have.property("name", "Updated Status");

    // verify update is in the array
    const updatedStatuses = await getStatuses(token, projectId);
    const updated = updatedStatuses.find((s) => s.id === statusId);
    expect(updated).to.have.property("name", "Updated Status");
  });

  it("should update a priority", async () => {
    const priorities = await getPriorities(token, projectId);
    const priorityId = priorities[0].id;
    const res = await request(app.callback())
      .put(`/projects/${projectId}/priorities/${priorityId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Updated Priority" });
    expect(res.status).to.equal(200);
    expect(res.body.priority).to.have.property("name", "Updated Priority");

    // verify update is in the array
    const updatedPriorities = await getPriorities(token, projectId);
    const updated = updatedPriorities.find((p) => p.id === priorityId);
    expect(updated).to.have.property("name", "Updated Priority");
  });

  it("should delete a status", async () => {
    const statuses = await getStatuses(token, projectId);
    const statusId = statuses[0].id;
    const res = await request(app.callback())
      .delete(`/projects/${projectId}/statuses/${statusId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).to.equal(200);

    // verify it's gone from the array
    const updatedStatuses = await getStatuses(token, projectId);
    const deleted = updatedStatuses.find((s) => s.id === statusId);
    expect(deleted).to.be.undefined;
  });

  it("should delete a priority", async () => {
    const priorities = await getPriorities(token, projectId);
    const priorityId = priorities[0].id;
    const res = await request(app.callback())
      .delete(`/projects/${projectId}/priorities/${priorityId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).to.equal(200);

    // verify it's gone from the array
    const updatedPriorities = await getPriorities(token, projectId);
    const deleted = updatedPriorities.find((p) => p.id === priorityId);
    expect(deleted).to.be.undefined;
  });
});
