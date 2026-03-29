const request = require("supertest");
const app = require("../app");
const { sequelize } = require("../models");

// --- CLEANUP ---
const cleanDB = async () => {
  await sequelize.query(`DELETE FROM "invites"`);
  await sequelize.query(`DELETE FROM "projectMembers"`);
  await sequelize.query(`DELETE FROM "tasks"`);
  await sequelize.query(`DELETE FROM "statuses"`);
  await sequelize.query(`DELETE FROM "priorities"`);
  await sequelize.query(`DELETE FROM "projects"`);
  await sequelize.query(`DELETE FROM "users"`);
};

// --- AUTH HELPERS ---
const loginUser = async (email, password) => {
  const res = await request(app.callback())
    .post("/auth/login")
    .send({ email, password });
  return res.body.token;
};

// --- PROJECT HELPERS ---
const createProject = async (token, projectName, description) => {
  const res = await request(app.callback())
    .post("/projects")
    .set("Authorization", `Bearer ${token}`)
    .send({ projectName, description });
  return res.body;
};

// --- STATUS & PRIORITY HELPERS ---
const getStatuses = async (token, projectId) => {
  const res = await request(app.callback())
    .get(`/projects/${projectId}/statuses`)
    .set("Authorization", `Bearer ${token}`);
  return res.body;
};

const getPriorities = async (token, projectId) => {
  const res = await request(app.callback())
    .get(`/projects/${projectId}/priorities`)
    .set("Authorization", `Bearer ${token}`);
  return res.body;
};

// --- TASK HELPERS ---
const createTask = async (token, projectId, statusId, priorityId) => {
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
  return res.body;
};

// --- INVITE HELPERS ---
const sendInvite = async (token, projectId, email) => {
  const res = await request(app.callback())
    .post(`/projects/${projectId}/invites`)
    .set("Authorization", `Bearer ${token}`)
    .send({ email });
  return res.body;
};

const acceptInvite = async (token, inviteId) => {
  const res = await request(app.callback())
    .post(`/invites/${inviteId}/accept`)
    .set("Authorization", `Bearer ${token}`);
  return res.body;
};

module.exports = {
  cleanDB,
  loginUser,
  createProject,
  getStatuses,
  getPriorities,
  createTask,
  sendInvite,
  acceptInvite,
};
