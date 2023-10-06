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
      .isString(),
    //   .custom(utilController.isValidObjectId),
    body("user", "User is required.")
      .exists()
      .isString(),
    //   .custom(utilController.isValidObjectId),
    body("role", "User role is required.")
      .exists()
      .isString(),
    //   .custom(utilController.isValidObjectId),
  ],
  utilController.customValidator,
  checkUser.checkCommunityExistence,
  checkUser.checkRole,
  communityController.addMember
);

// @route   DELETE /
// @desc    Remove member from the community
// @access  Private
  router.delete(
    "/:id",
    checkUser.checkLogin,
    communityController.removeMember
  );

module.exports = router;
