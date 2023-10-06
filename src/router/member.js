const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const checkUser = require("../middlewares/checkUser");

// @route   POST /
// @desc    Add a member by assigning roles
// @access  Private
router.post(
    "/",
    checkUser.checkLogin,
    [
        body("community", "Community is required.")
          .exists()
          .isString(),
          body("user", "User is required.")
          .exists()
          .isString(),
          body("role", "User role is required.")
          .exists()
          .isString(),
      ],
      checkUser.checkAdmin,
      )

module.exports = router;
