"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Invite extends Model {
    static associate(models) {
      Invite.belongsTo(models.Project, { foreignKey: "projectId" });
      Invite.belongsTo(models.User, { foreignKey: "inviterId", as: "inviter" });
      Invite.belongsTo(models.User, { foreignKey: "inviteeId", as: "invitee" });
    }
  }

  Invite.init(
    {
      projectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      inviterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      inviteeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "pending",
      },
    },
    {
      sequelize,
      modelName: "Invite",
      tableName: "invites",
      freezeTableName: true,
      timestamps: true,
      updatedAt: false,
      createdAt: "createdAt",
    },
  );

  return Invite;
};
