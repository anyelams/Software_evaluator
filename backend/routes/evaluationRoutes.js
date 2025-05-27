const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");
const {
  assignEvaluation,
  getAllEvaluations,
  getEvaluationById,
  getEvaluationFullDetails,
} = require("../controllers/evaluationController");

// solo admin
router.post("/", authenticateToken, authorizeRole("admin"), assignEvaluation);
router.get("/", authenticateToken, authorizeRole("admin"), getAllEvaluations);
router.get(
  "/:id",
  authenticateToken,
  authorizeRole("admin"),
  getEvaluationById
);
router.get(
  "/:id/full",
  authenticateToken,
  authorizeRole("admin"),
  getEvaluationFullDetails
);

module.exports = router;
