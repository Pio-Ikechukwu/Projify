const Koa = require("koa");
const json = require("koa-json");
const Joi = require("joi");
const koaRouter = require("koa-router");
const bodyParser = require("koa-bodyparser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require("@koa/cors");
const SECRET_KEY = "iloveanime!";
const saltRounds = 10;

const app = new Koa();
const router = new koaRouter();
app.use(cors());

app.use(json());
app.use(bodyParser());

// --- In-memory storage ---
let users = [];
let projects = [];
let projectMembers = [];
let tasks = [];
let invites = [];
let statuses = [];
let priorities = [];
let currentStatusId = 0;
let currentPriorityId = 0;
let currentUserId = 0;
let currentProjectId = 0;
let currentTaskId = 0;
let currentMemberId = 0;
let currentInviteId = 0;

// --- JOI SCHEMAS ---
const registerSchema = Joi.object({
  fullName: Joi.string().min(3).required().messages({
    "string.empty": "Full name is required",
    "string.min": "Full name must be at least 3 characters",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Email must be valid",
    "string.empty": "Email is required",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "string.empty": "Password is required",
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Email must be valid",
    "string.empty": "Email is required",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password is required",
  }),
});

const projectSchema = Joi.object({
  projectName: Joi.string().required().messages({
    "string.empty": "Project name is required",
  }),
  description: Joi.string().required().messages({
    "string.empty": "Description is required",
  }),
});

const taskSchema = Joi.object({
  title: Joi.string().required().messages({
    "string.empty": "Title is required",
  }),
  description: Joi.string().required().messages({
    "string.empty": "Description is required",
  }),
  assignedToID: Joi.number().messages({
    "number.base": "assignedToID must be a number",
  }),
  dueDate: Joi.date().required().messages({
    "date.base": "Due Date must be a valid date",
    "any.required": "Due Date is required",
  }),
  statusId: Joi.number().required().messages({
    "number.base": "statusId must be a number",
    "any.required": "statusId is required",
  }),
  priorityId: Joi.number().required().messages({
    "number.base": "priorityId must be a number",
    "any.required": "priorityId is required",
  }),
});

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
    const user = users.find((u) => u.id === decoded.userId);
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
  const project = projects.find(
    (p) => p.id === projectId && p.ownerId === ctx.state.user.userId,
  );
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
    const member = projectMembers.find(
      (m) =>
        m.projectId === Number(ctx.params.projectId) &&
        m.userId === assignedToID,
    );
    if (!member) {
      ctx.status = 400;
      ctx.body = { error: "assignedToID must be a member of this project" };
      return;
    }
  }
  await next();
};

const projectAccessGuard = async (ctx, next) => {
  const projectId = Number(ctx.params.projectId);
  const project = projects.find((p) => p.id === projectId);
  if (!project) {
    ctx.status = 404;
    ctx.body = { error: "Project Not Found" };
    return;
  }

  const isOwner = project.ownerId === ctx.state.user.userId;
  const isMember = projectMembers.find(
    (m) => m.projectId === projectId && m.userId === ctx.state.user.userId,
  );

  if (!isOwner && !isMember) {
    ctx.status = 403;
    ctx.body = { error: "Access Denied" };
    return;
  }
  ctx.state.project = project;
  await next();
};
// --- AUTH ROUTES ---
router.post("/auth/register", validate(registerSchema), async (ctx) => {
  const { fullName, email, password } = ctx.request.body;
  if (users.some((u) => u.email === email)) {
    ctx.status = 400;
    ctx.body = { error: "Email already registered!" };
    return;
  }
  currentUserId++;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  users.push({ id: currentUserId, fullName, email, password: hashedPassword });
  ctx.status = 201;
  ctx.body = { message: "User registered", userId: currentUserId };
});

router.post("/auth/login", validate(loginSchema), async (ctx) => {
  const { email, password } = ctx.request.body;
  const user = users.find((u) => u.email === email);
  if (!user)
    return (
      (ctx.status = 401),
      (ctx.body = { error: "Invalid email or password" })
    );
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    return (
      (ctx.status = 401),
      (ctx.body = { error: "Invalid email or password" })
    );
  const token = jwt.sign({ userId: user.id, email: user.email }, SECRET_KEY);
  ctx.body = { message: "Login successful", token };
});
router.get("/auth/me", authGuard, async (ctx) => {
  const user = users.find((u) => u.id === ctx.state.user.userId);
  if (!user) {
    ctx.status = 404;
    ctx.body = { error: "User not found" };
    return;
  }
  ctx.body = {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
  };
});
// --- PROJECT ROUTES ---
router.post("/projects", authGuard, validate(projectSchema), async (ctx) => {
  const { projectName, description, status, priority } = ctx.request.body;
  currentProjectId++;
  const newProject = {
    id: currentProjectId,
    ownerId: ctx.state.user.userId,
    projectName,
    description,
    status,
    priority,
  };
  projects.push(newProject);
  // after projects.push(newProject)

  const defaultStatuses = ["Not Started", "In Progress", "Completed"];
  const defaultPriorities = ["Low", "Moderate", "Extreme"];

  defaultStatuses.forEach((name) => {
    currentStatusId++;
    statuses.push({
      id: currentStatusId,
      projectId: newProject.id,
      name,
      isDefault: true,
    });
  });

  defaultPriorities.forEach((name) => {
    currentPriorityId++;
    priorities.push({
      id: currentPriorityId,
      projectId: newProject.id,
      name,
      isDefault: true,
    });
  });
  ctx.status = 201;
  ctx.body = newProject;
});

router.get("/projects", authGuard, async (ctx) => {
  const currentUserId = ctx.state.user.userId;

  const userProjects = projects.filter((p) => {
    const isOwner = p.ownerId === currentUserId;
    const isMember = projectMembers.find(
      (m) => m.projectId === p.id && m.userId === currentUserId,
    );
    return isOwner || isMember;
  });

  ctx.body = userProjects;
});

router.get(
  "/projects/:projectId",
  authGuard,
  projectAccessGuard,
  async (ctx) => {
    const project = ctx.state.project;
    const owner = users.find((u) => u.id === project.ownerId);
    ctx.body = { ...project, ownerName: owner?.fullName };
  },
);

router.put(
  "/projects/:projectId",
  authGuard,
  projectGuard,
  validate(projectSchema),
  async (ctx) => {
    const { projectName, description, status, priority } = ctx.request.body;
    const project = ctx.state.project;
    if (projectName) project.projectName = projectName;
    if (description) project.description = description;
    if (status) project.status = status;
    if (priority) project.priority = priority;
    ctx.body = { message: "Project updated", project };
  },
);

router.delete("/projects/:projectId", authGuard, projectGuard, async (ctx) => {
  const projectId = ctx.state.project.id;
  projects = projects.filter((p) => p.id !== projectId);
  tasks = tasks.filter((t) => t.projectId !== projectId);
  projectMembers = projectMembers.filter((m) => m.projectId !== projectId);
  invites = invites.filter((i) => i.projectId !== projectId);
  ctx.body = { message: "Project and related data deleted" };
});

// --- TASKS ---
router.post(
  "/projects/:projectId/tasks",
  authGuard,
  projectGuard,
  validate(taskSchema),
  memberGuard,
  async (ctx) => {
    const { title, description, assignedToID, dueDate, statusId, priorityId } =
      ctx.request.body;

    const status = statuses.find(
      (s) => s.id === statusId && s.projectId === ctx.state.project.id,
    );
    if (!status) {
      ctx.status = 400;
      ctx.body = { error: "Invalid statusId" };
      return;
    }

    const priority = priorities.find(
      (p) => p.id === priorityId && p.projectId === ctx.state.project.id,
    );
    if (!priority) {
      ctx.status = 400;
      ctx.body = { error: "Invalid priorityId" };
      return;
    }

    currentTaskId++;
    const newTask = {
      id: currentTaskId,
      projectId: ctx.state.project.id,
      ownerId: ctx.state.user.userId,
      title,
      description,
      assignedToID,
      dueDate,
      statusId,
      priorityId,
      status: status.name,
      priority: priority.name,
    };
    tasks.push(newTask);
    ctx.status = 201;
    ctx.body = newTask;
  },
);

router.get(
  "/projects/:projectId/tasks",
  authGuard,
  projectAccessGuard,
  async (ctx) => {
    const projectTasks = tasks.filter(
      (t) => t.projectId === ctx.state.project.id,
    );
    const enriched = projectTasks.map((t) => {
      const status = statuses.find((s) => s.id === t.statusId);
      const priority = priorities.find((p) => p.id === t.priorityId);
      return {
        ...t,
        status: status?.name || t.status,
        priority: priority?.name || t.priority,
      };
    });
    ctx.body = enriched;
  },
);
// PUT /projects/:projectId/tasks/:taskId — update a task
router.put(
  "/projects/:projectId/tasks/:taskId",
  authGuard,
  projectGuard,
  async (ctx) => {
    const taskId = Number(ctx.params.taskId);
    const task = tasks.find(
      (t) => t.id === taskId && t.projectId === ctx.state.project.id,
    );
    if (!task) {
      ctx.status = 404;
      ctx.body = { error: "Task not found" };
      return;
    }

    const { title, description, statusId, priorityId, dueDate, assignedToID } =
      ctx.request.body;

    if (title) task.title = title;
    if (description) task.description = description;
    if (dueDate) task.dueDate = dueDate;
    if (assignedToID) task.assignedToID = assignedToID;

    if (statusId) {
      const status = statuses.find(
        (s) => s.id === statusId && s.projectId === ctx.state.project.id,
      );
      if (!status) {
        ctx.status = 400;
        ctx.body = { error: "Invalid statusId" };
        return;
      }
      task.statusId = statusId;
      task.status = status.name;
    }

    if (priorityId) {
      const priority = priorities.find(
        (p) => p.id === priorityId && p.projectId === ctx.state.project.id,
      );
      if (!priority) {
        ctx.status = 400;
        ctx.body = { error: "Invalid priorityId" };
        return;
      }
      task.priorityId = priorityId;
      task.priority = priority.name;
    }

    ctx.body = { message: "Task updated", task };
  },
);

// DELETE /projects/:projectId/tasks/:taskId — delete a task
router.delete(
  "/projects/:projectId/tasks/:taskId",
  authGuard,
  projectGuard,
  async (ctx) => {
    const taskId = Number(ctx.params.taskId);
    const task = tasks.find(
      (t) => t.id === taskId && t.projectId === ctx.state.project.id,
    );
    if (!task) {
      ctx.status = 404;
      ctx.body = { error: "Task not found" };
      return;
    }

    tasks = tasks.filter((t) => t.id !== taskId);
    ctx.body = { message: "Task deleted" };
  },
);
// ==================== MEMBER ROUTES ====================

// GET /projects/:projectId/members
router.get(
  "/projects/:projectId/members",
  authGuard,
  projectAccessGuard,
  async (ctx) => {
    const members = projectMembers.filter(
      (m) => m.projectId === ctx.state.project.id,
    );
    const enriched = members.map((m) => {
      const user = users.find((u) => u.id === m.userId);
      return {
        id: m.id,
        userId: m.userId,
        projectId: m.projectId,
        role: m.role || "Member",
        fullName: user?.fullName,
        email: user?.email,
      };
    });
    ctx.body = enriched;
  },
);

// GET /projects/:projectId/members/:memberId
router.get(
  "/projects/:projectId/members/:memberId",
  authGuard,
  projectAccessGuard,
  async (ctx) => {
    console.log("Project members:", projectMembers);
    console.log("projectid", ctx.state.project.id);
    const member = projectMembers.find(
      (m) =>
        m.id === Number(ctx.params.memberId) &&
        m.projectId === ctx.state.project.id,
    );
    console.log("member: ", member);
    if (!member) {
      ctx.status = 404;
      ctx.body = { error: "Member not found" };
      return;
    }
    const user = users.find((u) => u.id === member.userId);
    ctx.body = {
      id: member.id,
      userId: member.userId,
      projectId: member.projectId,
      role: member.role || "Member",
      fullName: user?.fullName,
      email: user?.email,
    };
  },
);

// PUT /projects/:projectId/members/:memberId
router.put(
  "/projects/:projectId/members/:memberId",
  authGuard,
  projectGuard,
  async (ctx) => {
    const member = projectMembers.find(
      (m) =>
        m.id === Number(ctx.params.memberId) &&
        m.projectId === ctx.state.project.id,
    );
    if (!member) {
      ctx.status = 404;
      ctx.body = { error: "Member not found" };
      return;
    }
    const { role } = ctx.request.body;
    if (!role) {
      ctx.status = 400;
      ctx.body = { error: "Role is required" };
      return;
    }
    member.role = role;
    ctx.body = { message: "Member role updated", member };
  },
);

// DELETE /projects/:projectId/members/:memberId
router.delete(
  "/projects/:projectId/members/:memberId",
  authGuard,
  projectGuard,
  async (ctx) => {
    const member = projectMembers.find(
      (m) =>
        m.id === Number(ctx.params.memberId) &&
        m.projectId === ctx.state.project.id,
    );
    if (!member) {
      ctx.status = 404;
      ctx.body = { error: "Member not found" };
      return;
    }
    projectMembers = projectMembers.filter((m) => m.id !== member.id);
    ctx.body = { message: "Member removed from project" };
  },
);

// ==================== STATUS ROUTES ====================

// POST /projects/:projectId/statuses
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
    currentStatusId++;
    const newStatus = {
      id: currentStatusId,
      projectId: ctx.state.project.id,
      name,
    };
    statuses.push(newStatus);
    ctx.status = 201;
    ctx.body = newStatus;
  },
);

// GET /projects/:projectId/statuses
router.get(
  "/projects/:projectId/statuses",
  authGuard,
  projectAccessGuard,
  async (ctx) => {
    ctx.body = statuses.filter((s) => s.projectId === ctx.state.project.id);
  },
);

// PUT /projects/:projectId/statuses/:statusId
router.put(
  "/projects/:projectId/statuses/:statusId",
  authGuard,
  projectGuard,
  async (ctx) => {
    const status = statuses.find(
      (s) =>
        s.id === Number(ctx.params.statusId) &&
        s.projectId === ctx.state.project.id,
    );
    if (!status) {
      ctx.status = 404;
      ctx.body = { error: "Status not found" };
      return;
    }
    const { name } = ctx.request.body;
    if (!name) {
      ctx.status = 400;
      ctx.body = { error: "Status name is required" };
      return;
    }
    status.name = name;
    ctx.body = { message: "Status updated", status };
  },
);

// DELETE /projects/:projectId/statuses/:statusId
router.delete(
  "/projects/:projectId/statuses/:statusId",
  authGuard,
  projectGuard,
  async (ctx) => {
    const status = statuses.find(
      (s) =>
        s.id === Number(ctx.params.statusId) &&
        s.projectId === ctx.state.project.id,
    );
    if (!status) {
      ctx.status = 404;
      ctx.body = { error: "Status not found" };
      return;
    }
    statuses = statuses.filter((s) => s.id !== status.id);
    ctx.body = { message: "Status deleted" };
  },
);

// ==================== PRIORITY ROUTES ====================

// POST /projects/:projectId/priorities
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
    currentPriorityId++;
    const newPriority = {
      id: currentPriorityId,
      name,
      projectId: ctx.state.project.id,
    };
    priorities.push(newPriority);
    ctx.status = 201;
    ctx.body = newPriority;
  },
);

// GET /projects/:projectId/priorities
router.get(
  "/projects/:projectId/priorities",
  authGuard,
  projectAccessGuard,
  async (ctx) => {
    ctx.body = priorities.filter((p) => p.projectId === ctx.state.project.id);
  },
);

// PUT /projects/:projectId/priorities/:priorityId
router.put(
  "/projects/:projectId/priorities/:priorityId",
  authGuard,
  projectGuard,
  async (ctx) => {
    const priority = priorities.find(
      (p) =>
        p.id === Number(ctx.params.priorityId) &&
        p.projectId === ctx.state.project.id,
    );
    if (!priority) {
      ctx.status = 404;
      ctx.body = { error: "Priority not found" };
      return;
    }
    const { name } = ctx.request.body;
    if (!name) {
      ctx.status = 400;
      ctx.body = { error: "Priority name is required" };
      return;
    }
    priority.name = name;
    ctx.body = { message: "Priority updated", priority };
  },
);

// DELETE /projects/:projectId/priorities/:priorityId
router.delete(
  "/projects/:projectId/priorities/:priorityId",
  authGuard,
  projectGuard,
  async (ctx) => {
    const priority = priorities.find(
      (p) =>
        p.id === Number(ctx.params.priorityId) &&
        p.projectId === ctx.state.project.id,
    );
    if (!priority) {
      ctx.status = 404;
      ctx.body = { error: "Priority not found" };
      return;
    }
    priorities = priorities.filter((p) => p.id !== priority.id);
    ctx.body = { message: "Priority deleted" };
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
    const invitee = users.find((u) => u.email === email);
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
    const alreadyMember = projectMembers.find(
      (m) => m.projectId === ctx.state.project.id && m.userId === invitee.id,
    );
    if (alreadyMember) {
      ctx.status = 400;
      ctx.body = { error: "User is already a member of this project" };
      return;
    }
    const alreadyInvited = invites.find(
      (i) =>
        i.projectId === ctx.state.project.id &&
        i.inviteeId === invitee.id &&
        i.status === "pending",
    );
    if (alreadyInvited) {
      ctx.status = 400;
      ctx.body = {
        error: "User already has a pending invite for this project",
      };
      return;
    }

    currentInviteId++;
    const newInvite = {
      id: currentInviteId,
      projectId: ctx.state.project.id,
      inviterId: ctx.state.user.userId,
      inviteeId: invitee.id,
      email: invitee.email,
      status: "pending",
    };
    invites.push(newInvite);
    ctx.status = 201;
    ctx.body = newInvite;
  },
);
router.get(
  "/projects/:projectId/invites",
  authGuard,
  projectGuard,
  async (ctx) => {
    const projectInvites = invites.filter(
      (i) => i.projectId === ctx.state.project.id,
    );
    ctx.body = projectInvites;
  },
);
router.get("/invites/received", authGuard, async (ctx) => {
  const received = invites.filter((i) => i.inviteeId === ctx.state.user.userId);

  const enriched = received.map((invite) => {
    const project = projects.find((p) => p.id === invite.projectId);
    const inviter = users.find((u) => u.id === invite.inviterId);
    return {
      ...invite,
      projectName: project?.projectName,
      inviterName: inviter?.fullName,
    };
  });

  ctx.body = enriched;
});

// GET /invites/:inviteId — get a single invite
router.get("/invites/:inviteId", authGuard, async (ctx) => {
  const invite = invites.find((i) => i.id === Number(ctx.params.inviteId));
  if (!invite) {
    ctx.status = 404;
    ctx.body = { error: "Invite not found" };
    return;
  }
  ctx.body = invite;
});
router.put("/invites/:inviteId", authGuard, async (ctx) => {
  const invite = invites.find((i) => i.id === Number(ctx.params.inviteId));
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

  const newInvitee = users.find((u) => u.email === email);
  if (!newInvitee) {
    ctx.status = 404;
    ctx.body = { error: "No user found with that email" };
    return;
  }

  invite.email = newInvitee.email;
  invite.inviteeId = newInvitee.id;
  ctx.body = { message: "Invite updated", invite };
});
router.delete("/invites/:inviteId", authGuard, async (ctx) => {
  const invite = invites.find((i) => i.id === Number(ctx.params.inviteId));
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

  invites = invites.filter((i) => i.id !== invite.id);
  ctx.body = { message: "Invite cancelled" };
});
router.post("/invites/:inviteId/accept", authGuard, async (ctx) => {
  const invite = invites.find((i) => i.id === Number(ctx.params.inviteId));
  if (!invite) {
    ctx.status = 404;
    ctx.body = { error: "Invite not found" };
    return;
  }
  if (invite.inviteeId !== ctx.state.user.userId) {
    ctx.status = 403;
    ctx.body = { error: "Only the invited user can accept this invite" };
    return;
  }

  if (invite.status !== "pending") {
    ctx.status = 400;
    ctx.body = { error: `Invite is already ${invite.status}` };
    return;
  }
  invite.status = "accepted";
  currentMemberId++;
  const newMember = {
    id: currentMemberId,
    projectId: invite.projectId,
    userId: invite.inviteeId,
  };
  projectMembers.push(newMember);

  ctx.body = {
    message: "Invite accepted, you are now a project member",
    member: newMember,
  };
});
router.post("/invites/:inviteId/reject", authGuard, async (ctx) => {
  const invite = invites.find((i) => i.id === Number(ctx.params.inviteId));
  if (!invite) {
    ctx.status = 404;
    ctx.body = { error: "Invite not found" };
    return;
  }
  if (invite.inviteeId !== ctx.state.user.userId) {
    ctx.status = 403;
    ctx.body = { error: "Only the invited user can reject this invite" };
    return;
  }

  if (invite.status !== "pending") {
    ctx.status = 400;
    ctx.body = { error: `Invite is already ${invite.status}` };
    return;
  }

  invite.status = "rejected";
  ctx.body = { message: "Invite rejected" };
});

// --- START SERVER ---
app.use(router.routes()).use(router.allowedMethods());

if (require.main === module) {
  app.listen(3000, () => console.log("Server running on port 3000"));
}

module.exports = app;
