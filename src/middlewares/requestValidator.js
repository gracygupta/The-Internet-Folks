const { validationResult } = require("express-validator");
const User = require("../models/user");

// Custom validation function to check if the email already exists
exports.isEmailUnique = async (email) => {
  const existingUser = await User.findOne({ email: email });
  if (existingUser) {
    throw new Error("User with this email address already exists.");
  }
};

// Custom validation function to check if the user does not exist
exports.isUserExist = async (email) => {
  const existingUser = await User.findOne({ email: email });
  if (!existingUser) {
    throw new Error("Please provide a valid email address.");
  }
};

exports.validateSignup = async (req, res, next) => {
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

exports.validateSignin = async (req, res, next) => {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map((error) => ({
        param: error.path,
        message: error.msg,
        code: "INVALID_INPUT",
      }));
  
      const passwordError = formattedErrors.find(
        (error) => error.param === "password"
      );
  
      if (passwordError) {
        passwordError.code = "INVALID_CREDENTIALS";
      }
  
      return res.status(400).json({
        status: false,
        errors: formattedErrors,
      });
    } else {
      next();
    }
  };

  exports.customValidator = async (req, res, next) => {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map((error) => ({
        param: error.path,
        message: error.msg,
        code: "INVALID_INPUT",
      }));

      return res.status(400).json({
        status: false,
        errors: formattedErrors,
      });
    } else {
      next();
    }
  };