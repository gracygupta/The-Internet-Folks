const User = require("../models/user");
const Community = require("../models/community");
const jwt = require("jsonwebtoken");
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

exports.checkAdmin = async (req, res, next) => {
  try {
    const community = req.body.community;
    await Community.findById({ _id: community }).then((community) => {
      if (!community) {
        return res.status(400).json({
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
      if (community.owner === req.user._id) {
        next();
      } else {
        return res.status(400).json({
          status: false,
          errors: [
            {
              message: "You are not authorized to perform this action.",
              code: "NOT_ALLOWED_ACCESS",
            },
          ],
        });
      }
    });
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
