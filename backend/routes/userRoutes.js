const express = require("express");
const router = express.Router();
const pool = require("../db/pool");
const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");

router.get("/", authenticateToken, authorizeRole("admin"), async (req, res) => {
  const role = req.query.role;
  const query = role
    ? "SELECT id, name, email FROM users WHERE role = $1 ORDER BY name"
    : "SELECT id, name, email FROM users ORDER BY name";
  const params = role ? [role] : [];

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener usuarios:", err);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

module.exports = router;
