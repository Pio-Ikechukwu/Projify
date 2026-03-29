"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Task extends Model {
    static associate(models) {
      Task.belongsTo(models.Project, { foreignKey: "projectId" });
      Task.belongsTo(models.User, { foreignKey: "ownerId" });
      Task.belongsTo(models.User, { foreignKey: "assignedToId" });
      Task.belongsTo(models.Status, { foreignKey: "statusId" });
      Task.belongsTo(models.Priority, { foreignKey: "priorityId" });
    }
  }

  Task.init(
    {
      projectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      ownerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      assignedToId: {
        type: DataTypes.INTEGER,
      },
      statusId: {
        type: DataTypes.INTEGER,
      },
      priorityId: {
        type: DataTypes.INTEGER,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
      },
      dueDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Task",
      tableName: "tasks",
      freezeTableName: true,
      timestamps: true,
      updatedAt: false,
      createdAt: "createdAt",
    },
  );

  return Task;
};
