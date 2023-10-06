const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const checkLogin = require("../middlewares/checkUser").checkLogin;
const utilController = require("../middlewares/requestValidator");
const authController = require("../controllers/authControllers");

// @route   POST /signup
// @desc    Register user and return jwt and user object
// @access  Public
router.post(
  "/signup",
  [
    body("name", "Name should be at least 2 characters.")
      .exists()
      .isString()
      .isLength({ min: 2 }),
    body("email", "Email is required.")
      .exists()
      .isEmail()
      .custom(utilController.isEmailUnique),
    body("password", "Password should be at least 2 characters.")
      .exists()
      .isLength({ min: 6 }),
  ],
  utilController.validateSignup,
  authController.signUp
);

// @route   POST /signin
// @desc    Login user and return jwt and user object
// @access  Public
router.post("/signin",
[
    body("email", "Email is required.")
      .exists()
      .isEmail()
      .custom(utilController.isUserExist),
    body("password", "Password is required.")
      .exists()
  ],
  utilController.validateSignin,
  authController.signin
  );

// @route   GET /me
// @desc    Return the details of the currently signed in user
// @access  Private
router.get("/me", checkLogin, authController.myDetails);

module.exports = router;
