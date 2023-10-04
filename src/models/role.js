const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },
  },
  { timestamps: true }
);


const Role = new mongoose.model("Role", roleSchema);

module.exports = Role;