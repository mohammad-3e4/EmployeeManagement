const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/cathAsyncErrorsMiddleware");
const sendToken = require("../utils/jwtToken");
const asyncHandler = require("express-async-handler");
const dotenv = require("dotenv");
const multer = require("multer");
const db = require("../config/database");
dotenv.config({ path: "backend/config/config.env" });

//  Register new us

exports.getMember = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  let sql;
  let values;
  if (id) {
    sql = "SELECT * FROM staff WHERE staff_id = ?";
    values = [id];
  } else {
    return next(new ErrorHandler("Missing parameters", 400));
  }

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error during retrieval:", err);
      return next(new ErrorHandler("Error during retrieval", 500));
    }

    if (result.length > 0) {
      res.status(200).json({ success: true, staff: result[0] });
    } else {
      return next(new ErrorHandler("Student not found", 404));
    }
  });
});

exports.getStaff = asyncHandler(async (req, res, next) => {
  let sql = "SELECT * FROM staff";

  const { role, name } = req.query;

  if (role && name) {
    sql += ` WHERE role = ? AND staff_name = ?`;
    db.query(sql, [role, name], (err, result) => {
      if (err) {
        console.error("Error during retrieval:", err);
        return next(new ErrorHandler("Error during retrieval", 500));
      }
      res.status(200).json({ success: true, staff: result });
    });
  } else if (role) {
    sql += ` WHERE role = ?`;
    db.query(sql, [role], (err, result) => {
      if (err) {
        console.error("Error during retrieval:", err);
        return next(new ErrorHandler("Error during retrieval", 500));
      }
      res.status(200).json({ success: true, staff: result });
    });
  } else if (name) {
    sql += ` WHERE staff_name = ?`;
    db.query(sql, [name], (err, result) => {
      if (err) {
        console.error("Error during retrieval:", err);
        return next(new ErrorHandler("Error during retrieval", 500));
      }
      res.status(200).json({ success: true, students: result });
    });
  } else {
    db.query(sql, (err, result) => {
      if (err) {
        console.error("Error during retrieval:", err);
        return next(new ErrorHandler("Error during retrieval", 500));
      }
      res.status(200).json({ success: true, staff: result });
    });
  }
});

exports.updateMember = asyncHandler(async (req, res, next) => {
  const updatedFields = req.body;
  const { id } = req.params;
  const updateFieldsString = Object.keys(updatedFields)
    .map((key) => `${key}="${updatedFields[key]}"`)
    .join(", ");

  const sql = `UPDATE staff SET ${updateFieldsString} WHERE staff_id = '${Number(
    id
  )}';`;

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

exports.deleteMember = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler("Admission number (ID) is required", 400));
  }

  const sql = `DELETE FROM staff WHERE staff_id = ?`;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error during deletion:", err);
      return next(new ErrorHandler("Error during deletion", 500));
    }

    if (result.affectedRows > 0) {
      res.status(200).json({ success: true, message: "Deletion successful" });
    } else {
      return next(
        new ErrorHandler("Student not found or no changes applied", 404)
      );
    }
  });
});

exports.markAbsent = asyncHandler(async (req, res, next) => {
  const { staff_id, attendance, typeCase } = req.body;
  if (!staff_id) {
    return next(
      new ErrorHandler(`Staff Id (${staff_id}) is required`, 400)
    );
  }

  if (typeCase === 'leave_date') {
    // Delete existing record with the same student_id and absent_date
    const deleteSql = `DELETE FROM staff_attendance WHERE staff_id = ? AND absent_date = ?`;
    const deleteValues = [staff_id, attendance];
    db.query(deleteSql, deleteValues, (deleteErr, deleteResult) => {
      if (deleteErr) {
        console.error("Error during delete:", deleteErr);
        return next(new ErrorHandler("Error during delete", 500));
      }
      insertAttendanceRecord(staff_id, attendance, typeCase, res, next);
    });
  } else {
    insertAttendanceRecord(staff_id, attendance, typeCase, res, next);
  }
});

function insertAttendanceRecord(staff_id, attendance, typeCase, res, next) {
  const sql = `INSERT INTO staff_attendance (staff_id, ${typeCase}) VALUES (?, ?)`;
  const values = [staff_id, attendance];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error during insert:", err);
      return next(new ErrorHandler("Error during insert", 500));
    }

    if (result.affectedRows > 0) {
      res.status(200).json({
        success: true,
        message: "Absent record inserted successfully",
      });
    } else {
      return next(new ErrorHandler("Failed to insert absent record", 500));
    }
  });
}

exports.markPresent = asyncHandler(async (req, res, next) => {
  const { staff_id, attendance } = req.body;
  console.log(req.body);
  if (!staff_id) {
    return next(new ErrorHandler(`Student Id (${staff_id}) is required`, 400));
  }

  const sqlDelete = `DELETE FROM staff_attendance WHERE staff_id = ? AND leave_date = ?`;
  const valuesDelete = [staff_id, attendance];

  db.query(sqlDelete, valuesDelete, (err, result) => {
    if (err) {
      console.error("Error during delete:", err);
      return next(new ErrorHandler("Error during delete", 500));
    }

    if (result.affectedRows > 0) {
      res
        .status(200)
        .json({ success: true, message: "Absent record deleted successfully" });
    } else {
      return next(new ErrorHandler("Failed to delete absent record", 500));
    }
  });
});

exports.getEntries = asyncHandler(async (req, res, next) => {
  const sql = "SELECT * FROM staff_attendance;";
  console.log("HII");
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error during retrieval:", err);
      return next(new ErrorHandler("Error during retrieval", 500));
    }

    if (result.length > 0) {
      res.status(200).json({ success: true, absents: result });
    } else {
      return next(new ErrorHandler("Staff not found", 404));
    }
  });
});
