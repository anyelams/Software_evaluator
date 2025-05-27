const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");
const {
  getMyEvaluations,
  getEvaluationDetails,
  submitEvaluation,
  getEvaluationSummary,
  downloadEvaluationReport,
} = require("../controllers/evaluatorController");

// solo evaluadores
router.get(
  "/my-evaluations",
  authenticateToken,
  authorizeRole("evaluator"),
  getMyEvaluations
);
router.get(
  "/evaluation/:id/details",
  authenticateToken,
  authorizeRole("evaluator"),
  getEvaluationDetails
);
router.post(
  "/evaluation/:id/submit",
  authenticateToken,
  authorizeRole("evaluator"),
  submitEvaluation
);
router.get(
  "/evaluation/:id/summary",
  authenticateToken,
  authorizeRole("evaluator"),
  getEvaluationSummary
);
router.get(
  "/evaluation/:id/report",
  authenticateToken,
  authorizeRole("evaluator"),
  downloadEvaluationReport
);

module.exports = router;
