const Community = require("../models/community");
require("dotenv").config();

exports.createCommunity = async (req, res) => {
  try {
    const { name } = req.body;
    Community.create({
      name: name,
      slug: name,
      owner: req.user._id,
    })
      .then((doc) => {
        filteredData = {
          id: doc._id,
          name: doc.name,
          slug: doc.slug,
          owner: doc.owner.toString(),
          created_at: doc.createdAt,
          updated_at: doc.updatedAt,
        };
        return res.status(200).json({
          status: true,
          content: {
            data: filteredData,
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
