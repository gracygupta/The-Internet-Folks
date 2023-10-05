const bcrypt = require("bcryptjs");
const crypto = require("crypto");
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
                _id: doc._id,
                name: doc.name,
                email: doc.email,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt
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
                    access_token: "Cookie based authentication is used",
                  },
                });
              })
              .catch((err) => {
                console.log(err);
                res.status(500).json({ status: false });
              });
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json({ status: false });
          });
      }
    });
  });
};

exports.login = async (req, res) => {
    const {email, password} = req.body;

};

exports.myDetails = async (req, res) => {};
