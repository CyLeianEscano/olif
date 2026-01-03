const express = require("express");
const path = require("path");
const {
  sequelize,
  User,
  Admin,
  FoundItem,
  LostItem
} = require("./models");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/users", async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.json(user);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post("/admins", async (req, res) => {
  try {
    const admin = await Admin.create(req.body);
    res.json(admin);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get("/found-items", async (req, res) => {
  try {
    const items = await FoundItem.findAll({
      order: [["createdAt", "DESC"]],
      limit: 10
    });
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/lost-items", async (req, res) => {
  try {
    const item = await LostItem.create(req.body);
    res.json(item);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get("/lost-items", async (req, res) => {
  try {
    const items = await LostItem.findAll({
      order: [["createdAt", "DESC"]],
      limit: 10
    });
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    app.listen(3000, () => {
      console.log("Server running on http://localhost:3000");
    });
  } catch (e) {
    console.error(e);
  }
};

start();
