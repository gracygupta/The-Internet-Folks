const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const checkLogin = require("../middlewares/checkLogin").checkLogin;
const utilController = require("../middlewares/requestValidator");
const communityController = require("../controllers/communityControllers");

// @route   POST /
// @desc    Create a community from the given data.
// @access  Private
router.post(
    "/",
    checkLogin,
    [
        body("name", "Name should be at least 2 characters.")
          .exists()
          .isString()
          .isLength({ min:2, max: 128 }),
      ],
      utilController.customValidator, communityController.createCommunity );

module.exports = router;
