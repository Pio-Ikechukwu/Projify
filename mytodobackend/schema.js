const Joi = require("joi");

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

module.exports = { registerSchema, loginSchema, projectSchema, taskSchema };
