"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Project extends Model {
    static associate(models) {
      Project.belongsTo(models.User, { foreignKey: "ownerId" });
      Project.hasMany(models.Task, { foreignKey: "projectId" });
      Project.hasMany(models.Status, { foreignKey: "projectId" });
      Project.hasMany(models.Priority, { foreignKey: "projectId" });
      Project.hasMany(models.ProjectMember, { foreignKey: "projectId" });
      Project.hasMany(models.Invite, { foreignKey: "projectId" });
    }
  }

  Project.init(
    {
      ownerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      projectName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
      },
    },
    {
      sequelize,
      modelName: "Project",
      tableName: "projects",
      freezeTableName: true,
      timestamps: true,
      updatedAt: false,
      createdAt: "createdAt",
    },
  );

  return Project;
};
