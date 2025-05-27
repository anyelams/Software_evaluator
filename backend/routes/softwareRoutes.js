const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");
const {
  createSoftware,
  getSoftwaresByCompany,
  updateSoftware,
  deleteSoftware,
} = require("../controllers/softwareController");

router.post("/", authenticateToken, authorizeRole("admin"), createSoftware);
router.get(
  "/company/:companyId",
  authenticateToken,
  authorizeRole("admin"),
  getSoftwaresByCompany
);
router.put("/:id", authenticateToken, authorizeRole("admin"), updateSoftware);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole("admin"),
  deleteSoftware
);

module.exports = router;
