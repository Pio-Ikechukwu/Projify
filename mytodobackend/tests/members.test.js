const request = require("supertest");
const { expect } = require("chai");
const app = require("../app");
const {
  cleanDB,
  loginUser,
  createProject,
  sendInvite,
  acceptInvite,
} = require("./helpers");

describe("Member Routes", () => {
  let token;
  let token2;
  let projectId;
  let memberId;

  before(async () => {
    await cleanDB();
    await request(app.callback()).post("/auth/register").send({
      fullName: "Test User",
      email: "test@test.com",
      password: "123456",
    });
    await request(app.callback()).post("/auth/register").send({
      fullName: "Second User",
      email: "second@test.com",
      password: "123456",
    });
    token = await loginUser("test@test.com", "123456");
    token2 = await loginUser("second@test.com", "123456");
    const project = await createProject(
      token,
      "Test Project",
      "Test Description",
    );
    projectId = project.id;
    const invite = await sendInvite(token, projectId, "second@test.com");
    const accepted = await acceptInvite(token2, invite.id);
    memberId = accepted.member.id;
  });

  after(async () => await cleanDB());

  it("should get all members", async () => {
    const res = await request(app.callback())
      .get(`/projects/${projectId}/members`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an("array");
    expect(res.body.length).to.be.greaterThan(0);
    expect(res.body[0]).to.have.property("id");
    expect(res.body[0]).to.have.property("userId");
    expect(res.body[0]).to.have.property("role");
    expect(res.body[0]).to.have.property("fullName");
    expect(res.body[0]).to.have.property("email");
  });

  it("should get a single member", async () => {
    const res = await request(app.callback())
      .get(`/projects/${projectId}/members/${memberId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("id", memberId);
    expect(res.body).to.have.property("fullName", "Second User");
    expect(res.body).to.have.property("email", "second@test.com");
  });

  it("should update member role", async () => {
    const res = await request(app.callback())
      .put(`/projects/${projectId}/members/${memberId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ role: "Admin" });
    expect(res.status).to.equal(200);
    expect(res.body.member).to.have.property("role", "Admin");

    // verify update is in the array
    const allRes = await request(app.callback())
      .get(`/projects/${projectId}/members`)
      .set("Authorization", `Bearer ${token}`);
    const updated = allRes.body.find((m) => m.id === memberId);
    expect(updated).to.have.property("role", "Admin");
  });

  it("should remove a member", async () => {
    const res = await request(app.callback())
      .delete(`/projects/${projectId}/members/${memberId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).to.equal(200);

    // verify they're gone from the array
    const allRes = await request(app.callback())
      .get(`/projects/${projectId}/members`)
      .set("Authorization", `Bearer ${token}`);
    const deleted = allRes.body.find((m) => m.id === memberId);
    expect(deleted).to.be.undefined;
  });
});
