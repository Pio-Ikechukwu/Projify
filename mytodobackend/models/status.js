"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Status extends Model {
    static associate(models) {
      Status.belongsTo(models.Project, { foreignKey: "projectId" });
      Status.hasMany(models.Task, { foreignKey: "statusId" });
    }
  }

  Status.init(
    {
      projectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isDefault: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Status",
      tableName: "statuses",
      freezeTableName: true,
      timestamps: false,
    },
  );

  return Status;
};
