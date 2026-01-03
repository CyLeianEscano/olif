const bcrypt = require("bcrypt");
const { User, sequelize } = require("./models");

async function createUser() {
  try {
    await sequelize.authenticate();

    const fullName = "Test User";
    const college = "CAS";
    const yearAndSection = "3A";
    const password = "test123";

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      college,
      yearAndSection,
      passwordHash: hashedPassword
    });

    console.log("User created:", user.toJSON());
  } catch (e) {
    console.error("Error creating user:", e);
  } finally {
    await sequelize.close();
  }
}

createUser();