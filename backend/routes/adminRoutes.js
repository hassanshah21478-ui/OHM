const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getAdmin, updateAdmin, verifyPassword, changePassword } = require("../controllers/adminController");

router.get("/admin", authMiddleware, getAdmin);
router.post("/admin/verify-password", authMiddleware, verifyPassword);
router.put("/admin", authMiddleware, updateAdmin);
router.put("/admin/change-password", authMiddleware, changePassword);

module.exports = router;
