const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      validate: {
        validator: validator.isEmail,
        message: `is not a valid email`,
        isAsync: false,
      },
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Convert the email to lowercase
userSchema.pre("save", function (next) {
  this.email = this.email.toLowerCase();
  next();
});

const User = new mongoose.model("User", userSchema);

module.exports = User;
