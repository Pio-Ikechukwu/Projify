"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("invites", {
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
      inviterId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      inviteeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: "pending",
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("invites");
  },
};
