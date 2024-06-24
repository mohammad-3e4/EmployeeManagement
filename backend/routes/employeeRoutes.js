const express = require("express");
const router = express.Router();
const {
  isAuthenticatedUser,
  authorizeRoles,
} = require("../middlewares/authMiddleware");
const {
  getMember,
  getStaff,
  deleteMember,
  updateMember,
  getEntries,
  markPresent,
  markAbsent,
} = require("../controllers/staffController");
router.get("/", isAuthenticatedUser, authorizeRoles("admin"), getStaff);
router.patch("/present", isAuthenticatedUser, authorizeRoles("admin", 'teacher'), markPresent);
router.get(
  "/entries",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  getEntries
);
router
  .route("/:id")
  .get(isAuthenticatedUser, authorizeRoles("admin", 'teacher', ), getMember)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteMember)
  .post(isAuthenticatedUser, authorizeRoles("admin", "teacher"), updateMember);

router.put(
  "/attendance",
  isAuthenticatedUser,
  authorizeRoles("admin", "teacher"),
  markAbsent
);

module.exports = router;
