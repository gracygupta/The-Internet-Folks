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

// @route   GET /
// @desc    List all the existing community with pagination.
// @access  Private
router.get(
    "/",
     communityController.getAllCommunity );

// @route   GET /
// @desc    List all the members of a community with pagination
// @access  Private
router.get(
    "/:id/members",
    communityController.getAllMembers);

// @route   GET /
// @desc    List all the owned communities with pagination
// @access  Private
router.get(
    "/me/owner",
    checkLogin,
    communityController.getMyCommunity);

module.exports = router;
