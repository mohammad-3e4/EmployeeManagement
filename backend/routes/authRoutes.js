const experss = require("express");
const router = experss.Router();

const {  isAuthenticatedUser } = require("../middlewares/authMiddleware");
const { signin,signout, updateProfile,signup, forgotPassword, resetPassword, getCompanyProfile } = require("../controllers/authController");
router.post("/auth/signin", signin);
router.post("/auth/signup", signup);
router.get("/auth/signout", signout);
router.post("/auth/update",isAuthenticatedUser, updateProfile);
router.get("/",isAuthenticatedUser, getCompanyProfile);
router.post("/forgot-password",forgotPassword);
router.post("/reset-password/:token", resetPassword);
module.exports = router;
