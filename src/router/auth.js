const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const utilController = require("../middlewares/utilController").validateRequest;
const authController = require("../controllers/authController");

// @route   POST /signup
// @desc    Register user and return jwt and user object
// @access  Public
router.post(
  "/signup",
  [
    body("name", "name is required").exists().isString().isLength({ min: 2 }),
    body("email", "email is required").exists().isEmail(),
    body("password", "password is required (min char: 6)").exists().isLength({ min: 6 }),
  ],
  utilController,
  authController.signUp
);

// @route   POST /signin
// @desc    Login user and return jwt and user object
// @access  Public
// router.post("/signup", );

// @route   GET /me
// @desc    Return the details of the currently signed in user
// @access  Private
// router.get"/me", );

module.exports = router;
