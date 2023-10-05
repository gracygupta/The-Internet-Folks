const User = require("../models/user");
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
