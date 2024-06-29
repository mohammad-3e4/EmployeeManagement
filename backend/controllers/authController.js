const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/cathAsyncErrorsMiddleware");
const sendToken = require("../utils/jwtToken");
const asyncHandler = require("express-async-handler");
const dotenv = require("dotenv");
const multer = require("multer");
const db = require("../config/database");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
dotenv.config({ path: "backend/config/config.env" });

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "tubedev87@gmail.com",
    pass: "fipn xijp mame dmzj",
  },
});
exports.signin = catchAsyncErrors(async (request, response, next) => {
  const { email, password } = request.body;

  if (!email || !password) {
    return response
      .status(400)
      .json({ message: "Email and password are required" });
  }

  try {
    // Query to find user by email
    const query = "SELECT * FROM companies WHERE email = ?";
    const values = [email];

    // Wrap the query in a promise
    const executeQuery = (query, values) => {
      return new Promise((resolve, reject) => {
        db.query(query, values, (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        });
      });
    };

    const rows = await executeQuery(query, values);

    if (rows.length === 0) {
      return response
        .status(401)
        .json({ message: "Invalid email or password" });
    }

    const user = rows[0];

    // Compare the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return response
        .status(401)
        .json({ message: "Invalid email or password" });
    }

    // Create a JWT token
    sendToken(user, 201, response);
  } catch (error) {
    console.error(error);
    response.status(500).json({ message: "Internal server error" });
  }
});



// exports.signin = catchAsyncErrors(async (request, response, next) => {
//   const { email, password } = request.body;
//   const hashedPassword = await bcrypt.compare(password, 12);

//   const sql = `SELECT * FROM comapanies WHERE email=? AND password=?;`;

//   db.query(sql, [email, password], (err, result) => {
//     if (err) {
//       console.error("Error during login:", err);
//       return next(new ErrorHandler("Error during login !", 500));
//     }

//     if (result.length > 0) {
//       const user = result[0];
//       sendToken(user, 201, response);
//     } else {
//       return response
//         .status(404)
//         .json({ message: "User not found with provided credentials" });
//     }
//   });
// });

//  Log Out User
exports.signout = catchAsyncErrors(async (request, response, next) => {
  response.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  response.status(200).json({
    success: true,
    message: "Logout successfully !",
  });
});

exports.signup = catchAsyncErrors(async (request, response, next) => {
  const {
    email,
    company_name,
    establishment,
    licence_certificate,
    current_employees,
    phone,
    password,
  } = request.body;

  if (
    !email ||
    !company_name ||
    !establishment ||
    !licence_certificate ||
    !current_employees ||
    !phone ||
    !password
  ) {
    return response.status(400).json({ message: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 12);

    const finalUserData = { ...request.body, password: hashedPassword };
    const columns = Object.keys(finalUserData).join(", ");
    const placeholders = Object.keys(finalUserData)
      .map(() => "?")
      .join(", ");
    const values = Object.values(finalUserData);

    // Wrap the query in a promise
    const query = `INSERT INTO companies (${columns}) VALUES (${placeholders})`;

    const executeQuery = (query, values) => {
      return new Promise((resolve, reject) => {
        db.query(query, values, (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        });
      });
    };

    const rows = await executeQuery(query, values);

    if (rows.affectedRows === 1) {
      return response
        .status(201)
        .json({ message: "User registered successfully" });
    } else {
      return response.status(500).json({ message: "Failed to register user" });
    }
  } catch (error) {
    console.error(error);
    response.status(500).json({ message: "Internal server error" });
  }
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const updatedData = req.body;
  const { ...updatedFields } = updatedData;

  const updateFieldsString = Object.keys(updatedFields)
    .map((key) => `${key}="${updatedFields[key]}"`)
    .join(", ");

  const sql = `UPDATE companies SET ${updateFieldsString} WHERE id = ${req.company.id};`;
  console.log(sql);
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error during update:", err);
      next(new ErrorHandler("Error during update", 500));
    }

    if (result.affectedRows > 0) {
      res.status(200).json({ success: true, message: "Update successful" });
    } else {
      next(new ErrorHandler("User not found or no changes applied", 404));
    }
  });
});

exports.getCompanyProfile = asyncHandler(async (req, res, next) => {
  const ID = req.company.id;

  const sql = `SELECT * FROM companies WHERE id = ${ID};`;
  console.log(sql);

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error during profile retrieval:", err);
      return next(new ErrorHandler("Error during profile retrieval", 500));
    }

    if (result.length > 0) {
      const {password, ...rest} = result[0]
      res.status(200).json({ success: true, company: rest });
    } else {
      return next(new ErrorHandler("User not found", 404));
    }
  });
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  console.log(email);
  try {
    db.query(
      "SELECT * FROM companies WHERE email = ?",
      [email],
      async (error, results, fields) => {
        if (error) {
          return res.status(500).json({ message: error.message });
        }

        if (results.length === 0) {
          return res.status(400).json({ message: "User not found" });
        }

        const company = results[0];
        const resetToken = uuidv4();

        const jwtToken = jwt.sign(
          { id: company.id, resetToken },
          process.env.SECRET_KEY,
          {
            expiresIn: "1h",
          }
        );

        db.query(
          `UPDATE companies SET reset_password_token = ?, reset_password_expiry = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE id = ?`,
          [jwtToken, company.id],
          async (error, results, fields) => {
            if (error) {
              return res.status(500).json({ message: error.message });
            }
            try {
              await transporter.sendMail({
                from: "school-managemen@gmail.com",
                to: email,
                subject: "Password Reset",
                html: `<p>Click <a href="http://localhost:3000/reset-password/${jwtToken}">here</a> to reset your password.</p>`,
              });

              res.status(200).json({
                message: "Reset token generated and sent to " + email,
              });
            } catch (error) {
              res.status(500).json({ message: error.message });
            }
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ message: "Token and newPassword are required" });
    }

    const [results] = await db
      .promise()
      .query(
        "SELECT * FROM staff WHERE reset_password_token = ? AND reset_password_expiry > NOW()",
        [token]
      );

    if (results.length === 0) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const teacher = results[0];

    await db
      .promise()
      .query(
        "UPDATE staff SET password = ?, reset_password_token = NULL, reset_password_expiry = NULL WHERE staff_id = ?",
        [newPassword, teacher.staff_id]
      );

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    next(new ErrorHandler(error.message, 500));
  }
});
