"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Priority extends Model {
    static associate(models) {
      Priority.belongsTo(models.Project, { foreignKey: "projectId" });
      Priority.hasMany(models.Task, { foreignKey: "priorityId" });
    }
  }

  Priority.init(
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
      modelName: "Priority",
      tableName: "priorities",
      freezeTableName: true,
      timestamps: false,
    },
  );

  return Priority;
};
