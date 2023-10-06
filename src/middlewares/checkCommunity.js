const Community = require("../models/community");

exports.isCommunityExist = async (req,res,next) => {
    const existingCommunity = await Community.findById({ _id: req.body.community });
    if (!existingCommunity) {
      return res.status(400).json({
        "status": false,
        "errors": [
          {
            "param": "community",
            "message": "Community not found.",
            "code": "RESOURCE_NOT_FOUND"
          }
        ]
      })
    }
    next();
  };
