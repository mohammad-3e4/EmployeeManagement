const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config({ path: "../config/config.env" });

const sendToken = (user, statusCode, res) => {
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.SECRET_KEY,
    { expiresIn: "24h" }
  );
  delete user.password;
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
    user,
  });
};
module.exports = sendToken;
