const experss = require("express");
const authRoutes = require("./routes/authRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const db = require("./config/database");
const cors = require("cors");
const multer = require("multer");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const {isAuthenticatedUser, authorizeRoles} = require('./middlewares/authMiddleware')
const cookieParser = require("cookie-parser");
const upload = require('express-fileupload')
const errorMiddleware = require("./middlewares/errorMiddleware");

dotenv.config({path:'../config/config.env'});
const app = experss();
app.use(experss.json());
app.use(upload());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:false }));
app.use(cookieParser());

app.use(cors({origin:"*"}));


// Routes
app.post("/api/v1/student",isAuthenticatedUser, authorizeRoles('admin'),  async (req, res) => {
  try {
    const studentBioData = req.body;
    studentBioData.createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const tableName = "students";

    const columns = Object.keys(studentBioData).join(", ");
    const valuesPlaceholders = Object.keys(studentBioData)
      .map(() => "?")
      .join(", ");

    const insertQuery = `INSERT INTO ${tableName} (${columns}) VALUES (${valuesPlaceholders})`;

    const values = Object.values(studentBioData);

    await db.promise().query(insertQuery, values);

    res.status(201).json({
      success: true,
      message: `Student created successfully`,
    });
  } catch (error) {
    console.error("Error creating student bio-data:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "../../frontend/public");
  },
  filename: function (req, file, cb) {
    return cb(null, `${file.originalname}`);
  },
});

const uploadFile = multer({ storage: storage });
// login user


app.use("/api/v1/company", authRoutes);
app.use("/api/v1/employee", employeeRoutes);

// Middle wares
app.use(errorMiddleware);

module.exports = app;
