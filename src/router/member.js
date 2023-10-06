const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const checkUser = require("../middlewares/checkUser");
const utilController = require("../middlewares/requestValidator");
const communityController = require("../controllers/communityControllers");

// @route   POST /
// @desc    Add a member by assigning roles
// @access  Private
router.post(
    "/",
    checkUser.checkLogin,
    [
        body("community", "Community is required.")
          .exists()
          .isString().custom(utilController.isValidObjectId),
          body("user", "User is required.")
          .exists()
          .isString().custom(utilController.isValidObjectId),
          body("role", "User role is required.")
          .exists()
          .isString().custom(utilController.isValidObjectId),
      ],
      checkUser.checkAdmin,
      communityController.addMember
      )

module.exports = router;
