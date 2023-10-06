const Role = require("../models/role");

exports.createRole = async (req, res) => {
  try {
    const {name} = req.body;
    await Role.create({
        name: name
    }).then((role)=>{
        const formattedData = {
            id: role._id.toString(),
            name: role.name,
            created_at: role.createdAt,
            updated_at: role.updatedAt
        }
        return res.status(200).json({
            "status": true,
            "content": {
              "data": formattedData
            }
          })
    })
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
