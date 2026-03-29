const request = require("supertest");
const { expect } = require("chai");
const app = require("../app");
const { cleanDB, loginUser, createProject } = require("./helpers");

describe("Invite Routes", () => {
  let token;
  let token2;
  let projectId;
  let inviteId;
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
  });

  after(async () => await cleanDB());

  it("should send an invite", async () => {
    const res = await request(app.callback())
      .post(`/projects/${projectId}/invites`)
      .set("Authorization", `Bearer ${token}`)
      .send({ email: "second@test.com" });
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property("id");
    expect(res.body).to.have.property("status", "pending");
    expect(res.body).to.have.property("email", "second@test.com");
    inviteId = res.body.id;

    // verify it's in the project invites array
    const allInvites = await request(app.callback())
      .get(`/projects/${projectId}/invites`)
      .set("Authorization", `Bearer ${token}`);
    expect(allInvites.body).to.be.an("array");
    const created = allInvites.body.find((i) => i.id === inviteId);
    expect(created).to.exist;
    expect(created).to.have.property("status", "pending");
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
    expect(res.body.length).to.be.greaterThan(0);
    expect(res.body[0]).to.have.property("id");
    expect(res.body[0]).to.have.property("status");
    expect(res.body[0]).to.have.property("projectName");
  });

  it("should accept invite as user 2", async () => {
    const res = await request(app.callback())
      .post(`/invites/${inviteId}/accept`)
      .set("Authorization", `Bearer ${token2}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("member");
    memberId = res.body.member.id;
    expect(res.body.member).to.have.property("id");
    expect(res.body.member).to.have.property("projectId", projectId);

    // verify invite status is now accepted
    const receivedRes = await request(app.callback())
      .get("/invites/received")
      .set("Authorization", `Bearer ${token2}`);
    const accepted = receivedRes.body.find((i) => i.id === inviteId);
    expect(accepted).to.have.property("status", "accepted");
  });

  it("should not accept already accepted invite", async () => {
    const res = await request(app.callback())
      .post(`/invites/${inviteId}/accept`)
      .set("Authorization", `Bearer ${token2}`);
    expect(res.status).to.equal(400);
  });

  it("should reject a new invite", async () => {
    // remove member first so we can send a new invite
    await request(app.callback())
      .delete(`/projects/${projectId}/members/${memberId}`)
      .set("Authorization", `Bearer ${token}`);

    // send a new invite
    const inviteRes = await request(app.callback())
      .post(`/projects/${projectId}/invites`)
      .set("Authorization", `Bearer ${token}`)
      .send({ email: "second@test.com" });
    const newInviteId = inviteRes.body.id;

    const res = await request(app.callback())
      .post(`/invites/${newInviteId}/reject`)
      .set("Authorization", `Bearer ${token2}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("message", "Invite rejected");

    // verify invite status is now rejected
    const receivedRes = await request(app.callback())
      .get("/invites/received")
      .set("Authorization", `Bearer ${token2}`);
    const rejected = receivedRes.body.find((i) => i.id === newInviteId);
    expect(rejected).to.have.property("status", "rejected");
  });
});
