const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const utilController = require("../middlewares/requestValidator");
const roleController =require("../controllers/roleControllers");

// @route   POST /
// @desc    Create role from the given data
// @access  Public
router.post("/", 
[
    body("name", "Name should be at least 2 characters.")
      .exists()
      .isString()
      .isLength({ min:2 }),
  ],
  utilController.customValidator,
  roleController.createRole
  );


// @route   GET /
// @desc    List all the created roles with pagination
// @access  Public
// router.get("/", );

module.exports = router;