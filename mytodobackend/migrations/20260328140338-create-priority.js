"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("priorities", {
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
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      isDefault: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("priorities");
  },
};
