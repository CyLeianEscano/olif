const { DataTypes } = require("sequelize");
const { sequelize } = require("./db");

const User = sequelize.define("User", {
  fullName: { type: DataTypes.STRING, allowNull: false },
  college: { type: DataTypes.STRING, allowNull: false },
  yearAndSection: { type: DataTypes.STRING, allowNull: false },
  passwordHash: { type: DataTypes.STRING, allowNull: false }
});

const Admin = sequelize.define("Admin", {
  fullName: { type: DataTypes.STRING, allowNull: false },
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  passwordHash: { type: DataTypes.STRING, allowNull: false }
});

const FoundItem = sequelize.define("FoundItem", {
  itemType: { type: DataTypes.STRING, allowNull: false },
  itemColor: { type: DataTypes.STRING, allowNull: false },
  locationFound: { type: DataTypes.STRING, allowNull: false },
  dateTurnedIn: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  foundByName: { type: DataTypes.STRING, allowNull: false },
  stationKept: { type: DataTypes.STRING, allowNull: false },
  additionalNotes: { type: DataTypes.TEXT },
  claimed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
});

const LostItem = sequelize.define("LostItem", {
  dateReported: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  itemType: { type: DataTypes.STRING, allowNull: false },
  itemColor: { type: DataTypes.STRING, allowNull: false },
  locationLost: { type: DataTypes.STRING, allowNull: true },
  approxLostAt: { type: DataTypes.DATE },
  additionalDescription: { type: DataTypes.TEXT }
});

User.hasMany(LostItem, { foreignKey: "userId" });
LostItem.belongsTo(User, { foreignKey: "userId" });

Admin.hasMany(FoundItem, { foreignKey: "createdByAdminId" });
FoundItem.belongsTo(Admin, { foreignKey: "createdByAdminId" });

module.exports = { sequelize, User, Admin, FoundItem, LostItem };
