"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("projectMembers", {
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
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      role: {
        type: Sequelize.STRING,
        defaultValue: "Member",
      },
      joinedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("projectMembers");
  },
};
