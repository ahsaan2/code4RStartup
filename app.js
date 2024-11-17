var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
// import express-validator library
var expressValidator = require("express-validator");

var mongoose = require("mongoose");
var passport = require("passport");
var session = require("express-session");
require("./passport");
var config = require("./config");
// var { body, validationResult } = require("express-validator");
var indexRoute = require("./routes/index");
var authRoute = require("./routes/auth");
mongoose
  .connect(config.dbConnstring)
  .then(() => console.log("Database connection successful!"))
  .catch((err) => console.error("Database connection error:", err));

global.User = require("./models/user");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: config.sessionKey,
  resave: false,
  saveUninitialized: true,
  cookie: {secure: true}
}));
app.use(passport.initialize());
app.use(passport.session());
// use express validator
// app.use(expressValidator());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRoute);
app.use("/", authRoute);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
