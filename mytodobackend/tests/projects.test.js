const request = require("supertest");
const { expect } = require("chai");
const app = require("../app");
const { cleanDB, loginUser, createProject } = require("./helpers");

describe("Project Routes", () => {
  let token;
  let projectId;

  before(async () => {
    await cleanDB();
    await request(app.callback())
      .post("/auth/register")
      .send({
        fullName: "Test User",
        email: "test@test.com",
        password: "123456",
      });
    token = await loginUser("test@test.com", "123456");
  });

  after(async () => await cleanDB());

  describe("Create", () => {
    it("should create a project", async () => {
      const res = await request(app.callback())
        .post("/projects")
        .set("Authorization", `Bearer ${token}`)
        .send({ projectName: "Test Project", description: "Test Description" });
      expect(res.status).to.equal(201);
      expect(res.body).to.have.property("id");
      expect(res.body).to.have.property("projectName", "Test Project");
      expect(res.body).to.have.property("description", "Test Description");
      projectId = res.body.id;

      // verify it's in the array
      const allRes = await request(app.callback())
        .get("/projects")
        .set("Authorization", `Bearer ${token}`);
      expect(allRes.body).to.be.an("array");
      expect(allRes.body.length).to.be.greaterThan(0);
      const created = allRes.body.find((p) => p.id === projectId);
      expect(created).to.have.property("projectName", "Test Project");
    });

    it("should not create project without token", async () => {
      const res = await request(app.callback())
        .post("/projects")
        .send({ projectName: "Test Project", description: "Test Description" });
      expect(res.status).to.equal(401);
    });
  });

  describe("Read", () => {
    it("should get all projects", async () => {
      const res = await request(app.callback())
        .get("/projects")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an("array");
      expect(res.body.length).to.be.greaterThan(0);
      expect(res.body[0]).to.have.property("id");
      expect(res.body[0]).to.have.property("projectName");
      expect(res.body[0]).to.have.property("ownerId");
    });

    it("should get a single project", async () => {
      const res = await request(app.callback())
        .get(`/projects/${projectId}`)
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("projectName", "Test Project");
      expect(res.body).to.have.property("id", projectId);
    });
  });

  describe("Update", () => {
    it("should update a project", async () => {
      const res = await request(app.callback())
        .put(`/projects/${projectId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          projectName: "Updated Project",
          description: "Updated Description",
        });
      expect(res.status).to.equal(200);
      expect(res.body.project).to.have.property(
        "projectName",
        "Updated Project",
      );

      // verify update is reflected in the array
      const allRes = await request(app.callback())
        .get("/projects")
        .set("Authorization", `Bearer ${token}`);
      const updated = allRes.body.find((p) => p.id === projectId);
      expect(updated).to.have.property("projectName", "Updated Project");
    });
  });

  describe("Delete", () => {
    it("should delete a project", async () => {
      const res = await request(app.callback())
        .delete(`/projects/${projectId}`)
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).to.equal(200);

      // verify it's gone from the array
      const allRes = await request(app.callback())
        .get("/projects")
        .set("Authorization", `Bearer ${token}`);
      const deleted = allRes.body.find((p) => p.id === projectId);
      expect(deleted).to.be.undefined;
    });

    it("should not find deleted project", async () => {
      const res = await request(app.callback())
        .get(`/projects/${projectId}`)
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).to.equal(404);
    });
  });
});
