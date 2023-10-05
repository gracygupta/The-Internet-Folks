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

exports.getAllCommunity = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const skip = (page - 1) * pageSize;

    const data = await Community.find().skip(skip).limit(pageSize).populate({
      path: "owner",
      select: "_id name",
    });

    const formattedData = data.map((ele) => ({
      id: ele._id.toString(),
      name: ele.name,
      slug: ele.slug,
      owner: {
        id: ele.owner._id.toString(),
        name: ele.owner.name,
      },
      created_at: ele.createdAt,
      updated_at: ele.updatedAt,
    }));

    const total = await Community.count();

    const totalPages = Math.ceil(total / pageSize);

    const paginationMeta = {
      total: total,
      pages: totalPages,
      page: page,
    };

    const response = {
      status: true,
      content: {
        meta: paginationMeta,
        data: formattedData,
      },
    };

    res.status(200).json(response);
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
