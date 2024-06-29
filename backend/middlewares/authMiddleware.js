const jwt = require("jsonwebtoken");
const ErrorHandler = require("../utils/errorHandler");
const db = require("../config/database");
const dotenv = require("dotenv");
dotenv.config({ path: "backend/config/config.env" });

exports.isAuthenticatedUser = async (request, response, next) => {
  try {
    const token = request.cookies.token; // Assuming you're using a cookie parser middleware

    if (!token) {
    
      return next(
        new ErrorHandler("Login first to access this resource!", 401)
      ); 
    }

    let decode;
    try {
      decode = jwt.verify(token, process.env.SECRET_KEY);
    } catch (error) {
      throw new ErrorHandler("Invalid token. Please log in again.", 401); // Unauthorized
    }

    const sql = "SELECT * FROM companies WHERE id = ?";
    db.query(sql, [decode.id], (err, results) => {
      if (err) {
        console.log(err)
        throw new ErrorHandler("Error finding user in database", 500); // Internal Server Error
      }

      if (!results || results.length === 0) {
        throw new ErrorHandler("User not found", 404); // Not Found
      }

      request.company = results[0];
    
      next();
    });
  } catch (error) {
    next(error);
  }
};
exports.authorizeRoles = function (...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.company.role)) {
      return res.status(403).json({
        error: `Role (${req.company.role}) is not allowed to access this resource`
      });
    }
    next(); 
  };
};


// exports.protect = asyncHandler(async (req, res, next) => {
//   let token;
//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith("Bearer")
//   )
//     try {
//       token = req.headers.authorization.split(" ")[1];
//       const decode = jwt.verify(token, process.env.JWT_SECRET);
//       req.user = await User.findById(decode.id).select("-password");
//       next();
//     } catch (error) {
//       console.error(error);
//       res.status(401);
//       throw new Error("Not Authorized , Token failed");
//     }
//   if (!token) {
//     res.status(401);
//     throw new Error("Not Authorized, not token");
//   }
// });
