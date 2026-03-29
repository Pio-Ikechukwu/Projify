"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Project, { foreignKey: "ownerId" });
      User.hasMany(models.Task, { foreignKey: "ownerId" });
      User.hasMany(models.Task, { foreignKey: "assignedToId" });
      User.hasMany(models.ProjectMember, { foreignKey: "userId" });
      User.hasMany(models.Invite, { foreignKey: "inviterId" });
      User.hasMany(models.Invite, { foreignKey: "inviteeId" });
    }
  }

  User.init(
    {
      fullName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
      freezeTableName: true,
      timestamps: true,
      updatedAt: false,
      createdAt: "createdAt",
    },
  );

  return User;
};
