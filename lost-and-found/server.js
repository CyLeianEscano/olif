
const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
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

app.post("/register", async (req, res) => {
  try {
    const { fullName, college, yearAndSection, password } = req.body;
    if (!fullName || !college || !yearAndSection || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      fullName,
      college,
      yearAndSection,
      passwordHash: hashedPassword
    });
    res.json(user);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { fullName, password } = req.body;
    if (!fullName || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }
    const user = await User.findOne({
      where: { fullName }
    });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    res.json({ ...user.toJSON(), role: "user" });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Admin login (by username)
app.post("/admin-login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }
    const admin = await Admin.findOne({
      where: { username }
    });
    if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
      return res.status(401).json({ error: "Invalid admin credentials" });
    }
    res.json({ ...admin.toJSON(), role: "admin" });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post("/users", async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.json(user);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// app.post("/admins", async (req, res) => {
//   try {
//     const admin = await Admin.create(req.body);
//     res.json(admin);
//   } catch (e) {
//     res.status(400).json({ error: e.message });
//   }
// });

app.post("/found-items", async (req, res) => {
  try {
    const {
      itemType,
      itemColor,
      locationFound,
      foundByName,
      stationKept,
      additionalNotes,
      createdByAdminId
    } = req.body;

    if (!createdByAdminId) {
      return res.status(400).json({ error: "createdByAdminId is required" });
    }

    if (req.headers['x-admin-id'] != createdByAdminId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const admin = await Admin.findByPk(createdByAdminId);
    if (!admin) {
      return res.status(400).json({ error: "Invalid admin ID" });
    }

    const item = await FoundItem.create({
      itemType,
      itemColor,
      locationFound,
      foundByName,
      stationKept,
      additionalNotes,
      createdByAdminId
    });

    res.json(item);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get("/found-items", async (req, res) => {
  try {
    const items = await FoundItem.findAll({
      where: { claimed: false },
      order: [["createdAt", "DESC"]],
      limit: 10
    });
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Mark found item as claimed
app.post("/found-items/:id/claim", async (req, res) => {
  try {
    const item = await FoundItem.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    if (req.headers['x-admin-id'] != item.createdByAdminId) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    item.claimed = true;
    await item.save();
    res.json(item);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post("/lost-items", async (req, res) => {
  try {
    const {
      userId,
      itemType,
      itemColor,
      locationLost,
      additionalDescription
    } = req.body;

    if (req.headers['x-user-id'] != userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const item = await LostItem.create({
      userId,
      itemType,
      itemColor,
      locationLost,
      additionalDescription
    });

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

// Admin view of recent lost reports
app.get("/admin-lost-items", async (req, res) => {
  try {
    const items = await LostItem.findAll({
      include: [{ model: User, attributes: ["fullName", "college", "yearAndSection"] }],
      order: [["createdAt", "DESC"]],
      limit: 20
    });
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Lost reports for a specific user (for dashboard matching)
app.get("/my-lost-items", async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      // no user, just return empty list
      return res.json([]);
    }
    const items = await LostItem.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      limit: 20
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
    app.listen(3000);
  } catch (e) {
    console.error(e);
  }
};

start();

