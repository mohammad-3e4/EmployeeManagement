const dotenv = require("dotenv");
const mysql = require('mysql2');
dotenv.config({path:'../config/config.env'});
const connection = mysql.createConnection({
  host:'localhost',
  user: 'root',
  password: 'admin@root123',
  database:  'employee_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


 connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to database');
});
module.exports = connection;
