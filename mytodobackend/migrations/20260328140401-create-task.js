"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("tasks", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      projectId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "projects", key: "id" },
        onDelete: "CASCADE",
      },
      ownerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      assignedToId: {
        type: Sequelize.INTEGER,
        references: { model: "users", key: "id" },
        onDelete: "SET NULL",
      },
      statusId: {
        type: Sequelize.INTEGER,
        references: { model: "statuses", key: "id" },
        onDelete: "SET NULL",
      },
      priorityId: {
        type: Sequelize.INTEGER,
        references: { model: "priorities", key: "id" },
        onDelete: "SET NULL",
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
      },
      dueDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("tasks");
  },
};
