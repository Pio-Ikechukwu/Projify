"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ProjectMember extends Model {
    static associate(models) {
      ProjectMember.belongsTo(models.Project, { foreignKey: "projectId" });
      ProjectMember.belongsTo(models.User, { foreignKey: "userId" });
    }
  }

  ProjectMember.init(
    {
      projectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING,
        defaultValue: "Member",
      },
    },
    {
      sequelize,
      modelName: "ProjectMember",
      tableName: "projectMembers",
      freezeTableName: true,
      timestamps: true,
      updatedAt: false,
      createdAt: "joinedAt",
    },
  );

  return ProjectMember;
};
