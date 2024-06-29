const express = require("express");
const router = express.Router();
const {
  isAuthenticatedUser,
  authorizeRoles,
} = require("../middlewares/authMiddleware");
const {
  getEmployeeInformation,
  getEmployees,
  deleteMember,
  updateMember,
  getEntries,
  markPresent,
  markAbsent,
  createEmployee
} = require("../controllers/employeeController");

router.post("/create", isAuthenticatedUser, createEmployee);
router.get("/", isAuthenticatedUser, getEmployees);
router.patch("/present", isAuthenticatedUser, authorizeRoles("admin", 'teacher'), markPresent);
router.get(
  "/entries",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  getEntries
);
router
  .route("/:id")
  .get(isAuthenticatedUser, authorizeRoles("admin", 'teacher', ), getEmployeeInformation)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteMember)
  .post(isAuthenticatedUser, updateMember);
router.put(
  "/attendance",
  isAuthenticatedUser,
  authorizeRoles("admin", "teacher"),
  markAbsent
);

module.exports = router;
