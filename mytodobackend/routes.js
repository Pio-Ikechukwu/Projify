const koaRouter = require("koa-router");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  User,
  Project,
  ProjectMember,
  Status,
  Priority,
  Task,
  Invite,
} = require("./models");
const {
  validate,
  authGuard,
  projectGuard,
  memberGuard,
  projectAccessGuard,
} = require("./validators");
const {
  registerSchema,
  loginSchema,
  projectSchema,
  taskSchema,
} = require("./schema");

const router = new koaRouter();
const SECRET_KEY = "iloveanime!";
const saltRounds = 10;

// ==================== AUTH ROUTES ====================

router.post("/auth/register", validate(registerSchema), async (ctx) => {
  const { fullName, email, password } = ctx.request.body;
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    ctx.status = 409;
    ctx.body = { error: "Email already registered!" };
    return;
  }
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const user = await User.create({ fullName, email, password: hashedPassword });
  ctx.status = 201;
  ctx.body = { message: "User registered", userId: user.id };
});

router.post("/auth/login", validate(loginSchema), async (ctx) => {
  const { email, password } = ctx.request.body;
  const user = await User.findOne({ where: { email } });
  if (!user) {
    ctx.status = 401;
    ctx.body = { error: "Invalid email or password" };
    return;
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    ctx.status = 401;
    ctx.body = { error: "Invalid email or password" };
    return;
  }
  const token = jwt.sign({ userId: user.id, email: user.email }, SECRET_KEY);
  ctx.body = { message: "Login successful", token };
});

router.get("/auth/me", authGuard, async (ctx) => {
  const user = await User.findOne({
    where: { id: ctx.state.user.userId },
    attributes: ["id", "fullName", "email"],
  });
  if (!user) {
    ctx.status = 404;
    ctx.body = { error: "User not found" };
    return;
  }
  ctx.body = user;
});

// ==================== PROJECT ROUTES ====================

router.post("/projects", authGuard, validate(projectSchema), async (ctx) => {
  const { projectName, description } = ctx.request.body;
  const newProject = await Project.create({
    ownerId: ctx.state.user.userId,
    projectName,
    description,
  });

  const defaultStatuses = ["Not Started", "In Progress", "Completed"];
  const defaultPriorities = ["Low", "Moderate", "Extreme"];

  await Promise.all(
    defaultStatuses.map((name) =>
      Status.create({ projectId: newProject.id, name, isDefault: true }),
    ),
  );
  await Promise.all(
    defaultPriorities.map((name) =>
      Priority.create({ projectId: newProject.id, name, isDefault: true }),
    ),
  );

  ctx.status = 201;
  ctx.body = newProject;
});

router.get("/projects", authGuard, async (ctx) => {
  const owned = await Project.findAll({
    where: { ownerId: ctx.state.user.userId },
  });
  const memberProjects = await Project.findAll({
    include: [
      {
        model: ProjectMember,
        where: { userId: ctx.state.user.userId },
      },
    ],
  });
  ctx.body = [...owned, ...memberProjects];
});

router.get(
  "/projects/:projectId",
  authGuard,
  projectAccessGuard,
  async (ctx) => {
    const project = ctx.state.project;
    const owner = await User.findOne({
      where: { id: project.ownerId },
      attributes: ["fullName"],
    });
    ctx.body = { ...project.toJSON(), ownerName: owner?.fullName };
  },
);

router.put(
  "/projects/:projectId",
  authGuard,
  projectGuard,
  validate(projectSchema),
  async (ctx) => {
    const { projectName, description } = ctx.request.body;
    await ctx.state.project.update({ projectName, description });
    ctx.body = { message: "Project updated", project: ctx.state.project };
  },
);

router.delete("/projects/:projectId", authGuard, projectGuard, async (ctx) => {
  await ctx.state.project.destroy();
  ctx.body = { message: "Project and related data deleted" };
});

// ==================== STATUS ROUTES ====================

router.post(
  "/projects/:projectId/statuses",
  authGuard,
  projectGuard,
  async (ctx) => {
    const { name } = ctx.request.body;
    if (!name) {
      ctx.status = 400;
      ctx.body = { error: "Status name is required" };
      return;
    }
    const status = await Status.create({
      projectId: ctx.state.project.id,
      name,
    });
    ctx.status = 201;
    ctx.body = status;
  },
);

router.get(
  "/projects/:projectId/statuses",
  authGuard,
  projectAccessGuard,
  async (ctx) => {
    const statuses = await Status.findAll({
      where: { projectId: ctx.state.project.id },
    });
    ctx.body = statuses;
  },
);

router.put(
  "/projects/:projectId/statuses/:statusId",
  authGuard,
  projectGuard,
  async (ctx) => {
    const { name } = ctx.request.body;
    if (!name) {
      ctx.status = 400;
      ctx.body = { error: "Status name is required" };
      return;
    }
    const status = await Status.findOne({
      where: {
        id: Number(ctx.params.statusId),
        projectId: ctx.state.project.id,
      },
    });
    if (!status) {
      ctx.status = 404;
      ctx.body = { error: "Status not found" };
      return;
    }
    await status.update({ name });
    ctx.body = { message: "Status updated", status };
  },
);

router.delete(
  "/projects/:projectId/statuses/:statusId",
  authGuard,
  projectGuard,
  async (ctx) => {
    const status = await Status.findOne({
      where: {
        id: Number(ctx.params.statusId),
        projectId: ctx.state.project.id,
      },
    });
    if (!status) {
      ctx.status = 404;
      ctx.body = { error: "Status not found" };
      return;
    }
    await status.destroy();
    ctx.body = { message: "Status deleted" };
  },
);
// ==================== PRIORITY ROUTES ====================

router.post(
  "/projects/:projectId/priorities",
  authGuard,
  projectGuard,
  async (ctx) => {
    const { name } = ctx.request.body;
    if (!name) {
      ctx.status = 400;
      ctx.body = { error: "Priority name is required" };
      return;
    }
    const priority = await Priority.create({
      projectId: ctx.state.project.id,
      name,
    });
    ctx.status = 201;
    ctx.body = priority;
  },
);

router.get(
  "/projects/:projectId/priorities",
  authGuard,
  projectAccessGuard,
  async (ctx) => {
    const priorities = await Priority.findAll({
      where: { projectId: ctx.state.project.id },
    });
    ctx.body = priorities;
  },
);

router.put(
  "/projects/:projectId/priorities/:priorityId",
  authGuard,
  projectGuard,
  async (ctx) => {
    const { name } = ctx.request.body;
    if (!name) {
      ctx.status = 400;
      ctx.body = { error: "Priority name is required" };
      return;
    }
    const priority = await Priority.findOne({
      where: {
        id: Number(ctx.params.priorityId),
        projectId: ctx.state.project.id,
      },
    });
    if (!priority) {
      ctx.status = 404;
      ctx.body = { error: "Priority not found" };
      return;
    }
    await priority.update({ name });
    ctx.body = { message: "Priority updated", priority };
  },
);

router.delete(
  "/projects/:projectId/priorities/:priorityId",
  authGuard,
  projectGuard,
  async (ctx) => {
    const priority = await Priority.findOne({
      where: {
        id: Number(ctx.params.priorityId),
        projectId: ctx.state.project.id,
      },
    });
    if (!priority) {
      ctx.status = 404;
      ctx.body = { error: "Priority not found" };
      return;
    }
    await priority.destroy();
    ctx.body = { message: "Priority deleted" };
  },
);

// ==================== TASK ROUTES ====================

router.post(
  "/projects/:projectId/tasks",
  authGuard,
  projectGuard,
  validate(taskSchema),
  memberGuard,
  async (ctx) => {
    const { title, description, assignedToID, dueDate, statusId, priorityId } =
      ctx.request.body;

    const status = await Status.findOne({
      where: { id: statusId, projectId: ctx.state.project.id },
    });
    if (!status) {
      ctx.status = 400;
      ctx.body = { error: "Invalid statusId" };
      return;
    }

    const priority = await Priority.findOne({
      where: { id: priorityId, projectId: ctx.state.project.id },
    });
    if (!priority) {
      ctx.status = 400;
      ctx.body = { error: "Invalid priorityId" };
      return;
    }

    const task = await Task.create({
      projectId: ctx.state.project.id,
      ownerId: ctx.state.user.userId,
      assignedToId: assignedToID || null,
      statusId,
      priorityId,
      title,
      description,
      dueDate,
    });
    ctx.status = 201;
    ctx.body = task;
  },
);

router.get(
  "/projects/:projectId/tasks",
  authGuard,
  projectAccessGuard,
  async (ctx) => {
    const tasks = await Task.findAll({
      where: { projectId: ctx.state.project.id },
      include: [
        { model: Status, attributes: ["name"] },
        { model: Priority, attributes: ["name"] },
      ],
    });
    ctx.body = tasks.map((t) => ({
      ...t.toJSON(),
      status: t.Status?.name,
      priority: t.Priority?.name,
    }));
  },
);
router.put(
  "/projects/:projectId/tasks/:taskId",
  authGuard,
  projectGuard,
  async (ctx) => {
    const task = await Task.findOne({
      where: { id: Number(ctx.params.taskId), projectId: ctx.state.project.id },
    });
    if (!task) {
      ctx.status = 404;
      ctx.body = { error: "Task not found" };
      return;
    }

    const { title, description, statusId, priorityId, dueDate, assignedToID } =
      ctx.request.body;

    if (statusId) {
      const status = await Status.findOne({
        where: { id: statusId, projectId: ctx.state.project.id },
      });
      if (!status) {
        ctx.status = 400;
        ctx.body = { error: "Invalid statusId" };
        return;
      }
    }

    if (priorityId) {
      const priority = await Priority.findOne({
        where: { id: priorityId, projectId: ctx.state.project.id },
      });
      if (!priority) {
        ctx.status = 400;
        ctx.body = { error: "Invalid priorityId" };
        return;
      }
    }

    await task.update({
      title: title || task.title,
      description: description || task.description,
      dueDate: dueDate || task.dueDate,
      assignedToId: assignedToID || task.assignedToId,
      statusId: statusId || task.statusId,
      priorityId: priorityId || task.priorityId,
    });

    ctx.body = { message: "Task updated", task };
  },
);

router.delete(
  "/projects/:projectId/tasks/:taskId",
  authGuard,
  projectGuard,
  async (ctx) => {
    const task = await Task.findOne({
      where: { id: Number(ctx.params.taskId), projectId: ctx.state.project.id },
    });
    if (!task) {
      ctx.status = 404;
      ctx.body = { error: "Task not found" };
      return;
    }
    await task.destroy();
    ctx.body = { message: "Task deleted" };
  },
);

// ==================== MEMBER ROUTES ====================

router.get(
  "/projects/:projectId/members",
  authGuard,
  projectAccessGuard,
  async (ctx) => {
    const members = await ProjectMember.findAll({
      where: { projectId: ctx.state.project.id },
      include: [{ model: User, attributes: ["fullName", "email"] }],
    });
    ctx.body = members.map((m) => ({
      ...m.toJSON(),
      fullName: m.User.fullName,
      email: m.User.email,
    }));
  },
);

router.get(
  "/projects/:projectId/members/:memberId",
  authGuard,
  projectAccessGuard,
  async (ctx) => {
    const member = await ProjectMember.findOne({
      where: {
        id: Number(ctx.params.memberId),
        projectId: ctx.state.project.id,
      },
      include: [{ model: User, attributes: ["fullName", "email"] }],
    });
    if (!member) {
      ctx.status = 404;
      ctx.body = { error: "Member not found" };
      return;
    }
    ctx.body = {
      ...member.toJSON(),
      fullName: member.User.fullName,
      email: member.User.email,
    };
  },
);

router.put(
  "/projects/:projectId/members/:memberId",
  authGuard,
  projectGuard,
  async (ctx) => {
    const { role } = ctx.request.body;
    if (!role) {
      ctx.status = 400;
      ctx.body = { error: "Role is required" };
      return;
    }
    const member = await ProjectMember.findOne({
      where: {
        id: Number(ctx.params.memberId),
        projectId: ctx.state.project.id,
      },
    });
    if (!member) {
      ctx.status = 404;
      ctx.body = { error: "Member not found" };
      return;
    }
    await member.update({ role });
    ctx.body = { message: "Member role updated", member };
  },
);

router.delete(
  "/projects/:projectId/members/:memberId",
  authGuard,
  projectGuard,
  async (ctx) => {
    const member = await ProjectMember.findOne({
      where: {
        id: Number(ctx.params.memberId),
        projectId: ctx.state.project.id,
      },
    });
    if (!member) {
      ctx.status = 404;
      ctx.body = { error: "Member not found" };
      return;
    }
    await member.destroy();
    ctx.body = { message: "Member removed from project" };
  },
);

// ==================== INVITE ROUTES ====================

router.post(
  "/projects/:projectId/invites",
  authGuard,
  projectGuard,
  async (ctx) => {
    const { email } = ctx.request.body;
    if (!email) {
      ctx.status = 400;
      ctx.body = { error: "Email is required" };
      return;
    }
    const invitee = await User.findOne({ where: { email } });
    if (!invitee) {
      ctx.status = 404;
      ctx.body = { error: "No user found with that email" };
      return;
    }
    if (invitee.id === ctx.state.user.userId) {
      ctx.status = 400;
      ctx.body = { error: "You can't invite yourself" };
      return;
    }
    const existingMember = await ProjectMember.findOne({
      where: { projectId: ctx.state.project.id, userId: invitee.id },
    });
    if (existingMember) {
      ctx.status = 400;
      ctx.body = { error: "User is already a member of this project" };
      return;
    }
    const existingInvite = await Invite.findOne({
      where: {
        projectId: ctx.state.project.id,
        inviteeId: invitee.id,
        status: "pending",
      },
    });
    if (existingInvite) {
      ctx.status = 400;
      ctx.body = {
        error: "User already has a pending invite for this project",
      };
      return;
    }
    const invite = await Invite.create({
      projectId: ctx.state.project.id,
      inviterId: ctx.state.user.userId,
      inviteeId: invitee.id,
      email: invitee.email,
      status: "pending",
    });
    ctx.status = 201;
    ctx.body = invite;
  },
);

router.get(
  "/projects/:projectId/invites",
  authGuard,
  projectGuard,
  async (ctx) => {
    const invites = await Invite.findAll({
      where: { projectId: ctx.state.project.id },
    });
    ctx.body = invites;
  },
);

router.get("/invites/received", authGuard, async (ctx) => {
  const invites = await Invite.findAll({
    where: { inviteeId: ctx.state.user.userId },
    include: [
      { model: Project, attributes: ["projectName"] },
      { model: User, as: "inviter", attributes: ["fullName"] },
    ],
  });
  ctx.body = invites.map((i) => {
    return {
      ...i.toJSON(),
      projectName: i.Project?.projectName,
      inviterName: i.inviter?.fullName,
    };
  });
});

router.get("/invites/:inviteId", authGuard, async (ctx) => {
  const invite = await Invite.findOne({
    where: { id: Number(ctx.params.inviteId) },
  });
  if (!invite) {
    ctx.status = 404;
    ctx.body = { error: "Invite not found" };
    return;
  }
  ctx.body = invite;
});

router.put("/invites/:inviteId", authGuard, async (ctx) => {
  const invite = await Invite.findOne({
    where: { id: Number(ctx.params.inviteId) },
  });
  if (!invite) {
    ctx.status = 404;
    ctx.body = { error: "Invite not found" };
    return;
  }
  if (invite.inviterId !== ctx.state.user.userId) {
    ctx.status = 403;
    ctx.body = { error: "Only the inviter can update this invite" };
    return;
  }
  if (invite.status !== "pending") {
    ctx.status = 400;
    ctx.body = { error: "Can only update a pending invite" };
    return;
  }
  const { email } = ctx.request.body;
  if (!email) {
    ctx.status = 400;
    ctx.body = { error: "Email is required" };
    return;
  }
  const newInvitee = await User.findOne({ where: { email } });
  if (!newInvitee) {
    ctx.status = 404;
    ctx.body = { error: "No user found with that email" };
    return;
  }
  await invite.update({ email: newInvitee.email, inviteeId: newInvitee.id });
  ctx.body = { message: "Invite updated", invite };
});

router.delete("/invites/:inviteId", authGuard, async (ctx) => {
  const invite = await Invite.findOne({
    where: { id: Number(ctx.params.inviteId) },
  });
  if (!invite) {
    ctx.status = 404;
    ctx.body = { error: "Invite not found" };
    return;
  }
  if (invite.inviterId !== ctx.state.user.userId) {
    ctx.status = 403;
    ctx.body = { error: "Only the inviter can cancel this invite" };
    return;
  }
  if (invite.status === "accepted") {
    ctx.status = 400;
    ctx.body = { error: "Cannot cancel an already accepted invite" };
    return;
  }
  await invite.destroy();
  ctx.body = { message: "Invite cancelled" };
});

router.post("/invites/:inviteId/accept", authGuard, async (ctx) => {
  const invite = await Invite.findOne({
    where: { id: Number(ctx.params.inviteId) },
  });
  if (!invite) {
    ctx.status = 404;
    ctx.body = { error: "Invite not found" };
    return;
  }
  if (Number(invite.inviteeId) !== Number(ctx.state.user.userId)) {
    ctx.status = 403;
    ctx.body = { error: "Only the invited user can accept this invite" };
    return;
  }
  if (invite.status !== "pending") {
    ctx.status = 400;
    ctx.body = { error: `Invite is already ${invite.status}` };
    return;
  }
  await invite.update({ status: "accepted" });
  const member = await ProjectMember.create({
    projectId: invite.projectId,
    userId: invite.inviteeId,
  });
  ctx.body = {
    message: "Invite accepted, you are now a project member",
    member,
  };
});

router.post("/invites/:inviteId/reject", authGuard, async (ctx) => {
  const invite = await Invite.findOne({
    where: { id: Number(ctx.params.inviteId) },
  });
  if (!invite) {
    ctx.status = 404;
    ctx.body = { error: "Invite not found" };
    return;
  }
  if (Number(invite.inviteeId) !== Number(ctx.state.user.userId)) {
    ctx.status = 403;
    ctx.body = { error: "Only the invited user can reject this invite" };
    return;
  }
  if (invite.status !== "pending") {
    ctx.status = 400;
    ctx.body = { error: `Invite is already ${invite.status}` };
    return;
  }
  await invite.update({ status: "rejected" });
  ctx.body = { message: "Invite rejected" };
});

module.exports = router;
