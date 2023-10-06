const User = require("../models/user");
const Member = require("../models/member");
const Community = require("../models/community");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
require("dotenv").config();

exports.checkLogin = async (req, res, next) => {
  try {
    authToken = req.cookies.authtoken;
    if (!authToken) {
      return res.status(401).json({
        status: false,
        errors: [
          {
            message: "You need to sign in to proceed.",
            code: "NOT_SIGNEDIN",
          },
        ],
      });
    } else {
      jwt.verify(authToken, process.env.PRIVATE_KEY, async (err, decoded) => {
        if (!err) {
          await User.findById({ _id: decoded.data }).then((data) => {
            req.user = data;
            next();
          });
        } else {
          return res.status(401).json({
            status: true,
            errors: [
              {
                message: "You need to sign in to proceed.",
                code: "NOT_SIGNEDIN",
              },
            ],
          });
        }
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: false,
      errors: [
        {
          param: "internal_error",
          message: "Internal server error",
          code: "INTERNAL_ERROR",
        },
      ],
    });
  }
};

exports.checkCommunityExistence = async (req, res, next) => {
  try {
    const communityId = req.body.community;

    // Check if the community exists
    const existingCommunity = await Community.findById(communityId);

    if (!existingCommunity) {
      return res.status(404).json({
        status: false,
        errors: [
          {
            param: "community",
            message: "Community not found.",
            code: "RESOURCE_NOT_FOUND",
          },
        ],
      });
    }
    req.existingCommunity = existingCommunity;
    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: false,
      errors: [
        {
          param: "internal_error",
          message: "Internal server error",
          code: "INTERNAL_ERROR",
        },
      ],
    });
  }
};

exports.checkRole = async (req, res, next) => {
  try {
    const { community, user } = req.body;
    const communityId = new mongoose.Types.ObjectId(community);
    const userId = new mongoose.Types.ObjectId(req.user._id);

    // Create a pipeline to fetch data from the Member collection
    const pipeline = [
      {
        $match: {
          community: communityId,
          user: userId,
        },
      },
      {
        $lookup: {
          from: "roles",
          localField: "role",
          foreignField: "_id",
          as: "roleDetails",
        },
      },
      {
        $unwind: "$roleDetails",
      }
    ];

    // Use the pipeline to aggregate data from the Member collection
    const result = await Member.aggregate(pipeline);
    req.userRole = result[0]? result[0].roleDetails: {name:"not defined"};
    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: false,
      errors: [
        {
          param: "internal_error",
          message: "Internal server error",
          code: "INTERNAL_ERROR",
        },
      ],
    });
  }
};

