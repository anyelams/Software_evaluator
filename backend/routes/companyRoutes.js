const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");
const {
  createCompany,
  getCompanies,
  updateCompany,
  deleteCompany,
} = require("../controllers/companyController");

router.post("/", authenticateToken, authorizeRole("admin"), createCompany);
router.get("/", authenticateToken, authorizeRole("admin"), getCompanies);
router.put("/:id", authenticateToken, authorizeRole("admin"), updateCompany);
router.delete("/:id", authenticateToken, authorizeRole("admin"), deleteCompany);

module.exports = router;
