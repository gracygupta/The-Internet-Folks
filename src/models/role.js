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

// Convert the role name to lowercase
roleSchema.pre('save', function (next) {
	this.name = this.name.toLowerCase();
	next();
});


const Role = new mongoose.model("Role", roleSchema);

module.exports = Role;