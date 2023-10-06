const Role = require("../models/role");

exports.createRole = async (req, res) => {
  try {
    const { name } = req.body;
    await Role.create({
      name: name,
    }).then((role) => {
      const formattedData = {
        id: role._id.toString(),
        name: role.name,
        created_at: role.createdAt,
        updated_at: role.updatedAt,
      };
      return res.status(200).json({
        status: true,
        content: {
          data: formattedData,
        },
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

exports.getAllRoles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const skip = (page - 1) * pageSize;

    const data = await Role.find().skip(skip).limit(pageSize);

    const formattedData = data.map((ele) => ({
      id: ele._id.toString(),
      name: ele.name,
      created_at: ele.createdAt,
      updated_at: ele.updatedAt,
    }));

    const total = await Role.count();

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
