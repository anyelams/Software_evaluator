const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");
const {
  createStandard,
  getAllStandards,
  getStandardById,
  updateStandard,
  deleteStandard,
} = require("../controllers/standardController");

// Solo admin
router.post("/", authenticateToken, authorizeRole("admin"), createStandard);
router.get("/", authenticateToken, authorizeRole("admin"), getAllStandards);
router.get("/:id", authenticateToken, authorizeRole("admin"), getStandardById);
router.put("/:id", authenticateToken, authorizeRole("admin"), updateStandard);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole("admin"),
  deleteStandard
);

module.exports = router;
