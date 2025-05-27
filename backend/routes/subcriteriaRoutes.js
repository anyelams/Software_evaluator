const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");
const {
  createSubcriteria,
  getSubcriteriaByCriteria,
  updateSubcriteria,
  deleteSubcriteria,
} = require("../controllers/subcriteriaController");

router.post("/", authenticateToken, authorizeRole("admin"), createSubcriteria);
router.get(
  "/criteria/:criteriaId",
  authenticateToken,
  authorizeRole("admin"),
  getSubcriteriaByCriteria
);
router.put(
  "/:id",
  authenticateToken,
  authorizeRole("admin"),
  updateSubcriteria
);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole("admin"),
  deleteSubcriteria
);

module.exports = router;
