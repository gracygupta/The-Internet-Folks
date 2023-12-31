const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
require("dotenv").config();

const signCookie = (user) => {
  return new Promise((resolve, reject) => {
    jwt.sign(
      {
        data: user.id,
      },
      process.env.PRIVATE_KEY,
      { expiresIn: "24h" },
      (err, token) => {
        if (err) {
          reject(err);
        } else {
          resolve(token);
        }
      }
    );
  });
};

exports.signUp = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    bcrypt.genSalt(12, function (err, salt) {
      bcrypt.hash(password, salt, function (err, hashedPassword) {
        if (!err) {
          User.create({
            name: name,
            email: email,
            password: hashedPassword,
          })
            .then((doc) => {
              const filteredDoc = {
                id: doc._id,
                name: doc.name,
                email: doc.email,
                created_at: doc.createdAt,
              };

              signCookie(filteredDoc)
                .then((token) => {
                  res.cookie("authtoken", token);
                  res.status(200).json({
                    status: true,
                    content: {
                      data: filteredDoc,
                    },
                    meta: {
                      access_token: "", //Cookie based auth is used
                    },
                  });
                })
                .catch((err) => {
                  console.log(err);
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
                });
            })
            .catch((err) => {
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
            });
        }
      });
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

exports.signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    const isCorrectPassword = await bcrypt.compare(password, user.password);

    if (!isCorrectPassword) {
      return res.status(400).json({
        status: false,
        errors: [
          {
            param: "password",
            message: "The credentials you provided are invalid.",
            code: "INVALID_CREDENTIALS",
          },
        ],
      });
    } else {
      const filteredDoc = {
        id: user._id,
        name: user.name,
        email: user.email,
        created_at: user.createdAt,
      };
      signCookie(filteredDoc)
        .then((token) => {
          res.cookie("authtoken", token);
          res.status(200).json({
            status: true,
            content: {
              data: filteredDoc,
            },
            meta: {
              access_token: "", //Cookie based auth is used
            },
          });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({ status: false });
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

exports.myDetails = async (req, res) => {
  try {
    const filteredDoc = {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        created_at: req.user.createdAt,
      };
    return res.status(200).json({
      status: true,
      content: {
        data: filteredDoc,
      },
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
