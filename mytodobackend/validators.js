const jwt = require("jsonwebtoken");
const { User, Project, ProjectMember } = require("./models");
const SECRET_KEY = "iloveanime!";

// --- VALIDATION MIDDLEWARE ---
const validate = (schema) => async (ctx, next) => {
  const { error, value } = schema.validate(ctx.request.body);
  if (error) {
    ctx.status = 400;
    ctx.body = {
      error: "Validation failed",
      details: error.details.map((d) => ({
        field: d.path[0],
        message: d.message,
      })),
    };
    return;
  }
  ctx.request.body = value;
  await next();
};

// --- AUTH GUARD ---
const authGuard = async (ctx, next) => {
  const authHeader = ctx.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    ctx.status = 401;
    ctx.body = { error: "No token provided" };
    return;
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const user = await User.findOne({ where: { id: decoded.userId } });
    if (!user) {
      ctx.status = 401;
      ctx.body = { error: "User no longer exists" };
      return;
    }
    ctx.state.user = decoded;
    await next();
  } catch {
    ctx.status = 401;
    ctx.body = { error: "Invalid or expired token" };
  }
};

// --- PROJECT GUARD (OWNER ONLY) ---
const projectGuard = async (ctx, next) => {
  const projectId = Number(ctx.params.projectId);
  const project = await Project.findOne({
    where: { id: projectId, ownerId: ctx.state.user.userId },
  });
  if (!project) {
    ctx.status = 404;
    ctx.body = { error: "Project not found" };
    return;
  }
  ctx.state.project = project;
  await next();
};

// --- MEMBER GUARD ---
const memberGuard = async (ctx, next) => {
  const { assignedToID } = ctx.request.body;
  if (assignedToID) {
    const member = await ProjectMember.findOne({
      where: { projectId: Number(ctx.params.projectId), userId: assignedToID },
    });
    if (!member) {
      ctx.status = 400;
      ctx.body = { error: "assignedToID must be a member of this project" };
      return;
    }
  }
  await next();
};

// --- PROJECT ACCESS GUARD (OWNER OR MEMBER) ---
const projectAccessGuard = async (ctx, next) => {
  const projectId = Number(ctx.params.projectId);
  const project = await Project.findOne({ where: { id: projectId } });
  if (!project) {
    ctx.status = 404;
    ctx.body = { error: "Project Not Found" };
    return;
  }
  const isOwner = project.ownerId === ctx.state.user.userId;
  const member = await ProjectMember.findOne({
    where: { projectId, userId: ctx.state.user.userId },
  });
  if (!isOwner && !member) {
    ctx.status = 403;
    ctx.body = { error: "Access Denied" };
    return;
  }
  ctx.state.project = project;
  await next();
};

module.exports = {
  validate,
  authGuard,
  projectGuard,
  memberGuard,
  projectAccessGuard,
};
