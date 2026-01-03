const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("lost_and_found_db", "root", "", {
  host: "localhost",
  dialect: "mysql"
});

module.exports = { sequelize };
