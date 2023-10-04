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
        ref: "User"
    },
  },
  { timestamps: true }
);

const Community = new mongoose.model("Community", communitySchema);

module.exports = Community;