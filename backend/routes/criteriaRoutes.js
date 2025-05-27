const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");
const {
  createCriteria,
  getCriteriaByStandard,
  updateCriteria,
  deleteCriteria,
} = require("../controllers/criteriaController");

// Solo admin
router.post("/", authenticateToken, authorizeRole("admin"), createCriteria);
router.get(
  "/standard/:standardId",
  authenticateToken,
  authorizeRole("admin"),
  getCriteriaByStandard
);
router.put("/:id", authenticateToken, authorizeRole("admin"), updateCriteria);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole("admin"),
  deleteCriteria
);

module.exports = router;
