const { validationResult } = require("express-validator");
const User = require("../models/user");

// Custom validation function to check if the email already exists
exports.isEmailUnique = async (value) => {
    const existingUser = await User.findOne({ email: value });
    if (existingUser) {
      throw new Error("User with this email address already exists.");
    }
  };

exports.validateRequest = (req, res, next) => {
    const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => ({
      param: error.path,
      message: error.msg,
      code: "INVALID_INPUT",
    }));

    const emailError = formattedErrors.find((error) => error.param === "email");

    if (emailError) {
      emailError.code = "RESOURCE_EXISTS";
    }
    
    return res.status(400).json({
      status: false,
      errors: formattedErrors,
    });
  } else {
    next();
  }
};


