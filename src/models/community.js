const mongoose = require("mongoose");

const communitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    owner: { 
        type: mongoose.Schema.Types.String,
        required: true,
        ref: "User"
    },
  },
  { timestamps: true }
);

communitySchema.pre("save", function (next) {
    this.slug = this.slug.toLowerCase();
    next();
  });

const Community = new mongoose.model("Community", communitySchema);

module.exports = Community;