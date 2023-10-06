const mongoose = require("mongoose");

const communitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
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
    //replace white spaces with hiphens
    this.slug = this.slug.toLowerCase().replace(/\s+/g, "-");
    next();
  });

const Community = new mongoose.model("Community", communitySchema);

module.exports = Community;