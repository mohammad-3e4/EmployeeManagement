const app = require("./app");
const dotenv = require("dotenv");

dotenv.config({path:'../config/config.env'});
const express = require("express");
const path = require("path");

// Handling Uncaught Exception Error
process.on('uncaughtException', (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down due to Uncaught Exception ");
  process.exit(1);
});



if(process.env.NODE_ENV === 'PRODUCTION'){
  const path = require("path");
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'));
  });
}
  


// Server runnig 
const server = app.listen(process.env.PORT, () => {
  console.log(`Server is starting on port:${process.env.PORT} in ${process.env.NODE_ENV} mode`);
});





// Handling Unhandled Promise Rejection
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down the server due to Unhandled Promise Rejection");
  server.close(() => {
    process.exit(1);
  });
});
