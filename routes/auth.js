const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const User = require("../models/user"); // Ensure path is correct
const passport = require("passport");
const { route } = require(".");

// router.get('/login', function(req, res, next){
//     res.render('login', {title: "Login your account"})
// })
router
  .route("/login")
  .get(function (req, res, next) {
    res.render("login", { title: "Login your account" });
  })
  .post(
    passport.authenticate("local", {
      failureRedirect: "/login", // if we have username or password Incorrect, we will be redirected to the login page.
    }),
    function (req, res) {
      // if everything is correct, we will be redirected to the home page.
      res.redirect("/");
    }
  );

router
  .route("/register")
  .get(function (req, res, next) {
    res.render("register", { title: "Register a new account" });
  })
  .post(
    [
      body("name", "Empty Name").notEmpty(),
      body("email", "Invalid Email").isEmail(),
      body("password", "Empty Password").notEmpty(),
      body("confirmPassword")
        .notEmpty()
        .withMessage("Empty Confirm Password")
        .custom((value, { req }) => value === req.body.password)
        .withMessage("Passwords do not match"),
    ],
    async function (req, res, next) {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.render("register", {
          title: "Register a new account",
          name: req.body.name,
          email: req.body.email,
          errorMessages: errors.array(),
        });
      }

      try {
        const user = new User();
        user.name = req.body.name;
        user.email = req.body.email;
        user.setPassword(req.body.password); // Ensure `setPassword` is implemented in User model

        await user.save(); // to pause the execution of the function, until a promise is resolverd or rejected

        res.redirect("/login");
      } catch (err) {
        res.render("register", {
          title: "Register a new account",
          errorMessages: [{ msg: err.message }],
        });
      }
    }
  );

// Logout
router.get("/logout", function (req, res) {
  req.logOut();
  res.redirect("/");
});
// router for facebook
router.get(
  "/auth/facebook",
  passport.authenticate("facebook", { scope: "email" })
);
router.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: "/",
    failureRedirect: "/",
  })
);

module.exports = router;
