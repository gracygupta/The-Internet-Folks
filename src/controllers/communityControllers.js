const Community = require("../models/community");
const Member = require("../models/member");
const User = require("../models/user");
const Role = require("../models/role");
require("dotenv").config();
const slugify = require("slugify");

async function createUniqueSlug(name) {
  let slug = slugify(name, { lower: true });

  var existingCommunity = await Community.findOne({ slug: slug });
  let counter = 1;
  while (existingCommunity) {
    slug = slugify(name, { lower: true });
    slug = `${slug}-${counter}`;
    existingCommunity = await Community.findOne({ slug: slug });
    counter++;
  }

  return slug;
}


exports.createCommunity = async (req, res) => {
  try {
    const { name } = req.body;
    let slug = await createUniqueSlug(name);
    await Community.create({
      name: name,
      slug: slug,
      owner: req.user._id,
    })
      .then(async(doc) => {
        const role = await Role.findOne({name: "Community Admin"});
        await Member.create({
            community: doc._id,
            user: req.user._id,
            role: role._id
        })
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

exports.getAllMembers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const skip = (page - 1) * pageSize;

    const data = await Member.find({ community: req.params.id }) //access using slug
      .skip(skip)
      .limit(pageSize)
      .populate({
        path: "user",
        select: "_id name",
      })
      .populate({
        path: "role",
        select: "_id name",
      });

    const formattedData = data.map((ele) => ({
      id: ele._id.toString(),
      community: ele.community.toString(),
      user: {
        id: ele.user._id.toString(),
        name: ele.user.name,
      },
      role: {
        id: ele.role._id.toString(),
        name: ele.role.name,
      },
      created_at: ele.createdAt,
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

exports.getOwnedCommunity = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const skip = (page - 1) * pageSize;

    const data = await Community.find({ owner: req.user._id })
      .skip(skip)
      .limit(pageSize);

    const formattedData = data.map((ele) => ({
      id: ele._id.toString(),
      name: ele.name,
      slug: ele.slug,
      owner: ele.owner.toString(),
      created_at: ele.createdAt,
      updated_at: ele.updatedAt,
    }));

    const total = await Community.countDocuments({ owner: req.user._id });

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

exports.getJoinedCommunity = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const skip = (page - 1) * pageSize;

    const data = await Member.find({ user: req.user._id })
      .skip(skip)
      .limit(pageSize)
      .populate({
        path: "community",
        select: "_id name slug owner createdAt updatedAt",
      })
      .populate({
        path: "owner",
        select: "_id name",
      });

    console.log(data);

    const formattedData = data.map((ele) => ({
      id: ele._id.toString(),
      name: ele.name,
      slug: ele.slug,
      owner: {
        id: ele.owner._id,
        name: ele.owner.name,
      },
      created_at: ele.createdAt,
      updated_at: ele.updatedAt,
    }));
    const total = await Member.countDocuments({ user: req.user._id });

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

exports.addMember = async (req, res) => {
  try {
    const {community, user, role} = req.body;
    //check if user does not found
    await User.findById({_id: user}).then(user=>{
        if(!user){
            return res.status(400).json({
                "status": false,
                "errors": [
                  {
                    "param": "user",
                    "message": "User not found.",
                    "code": "RESOURCE_NOT_FOUND"
                  }
                ]
              });
        }
    });
    //check if member already exists
    await Member.findOne({ community: community, user: user }).then((member)=>{
        if(member){
            return res.status(400).json({
                "status": false,
                "errors": [
                  {
                    "message": "User is already added in the community.",
                    "code": "RESOURCE_EXISTS"
                  }
                ]
              });
        }
    });
    //check if role does not exist
    await Role.findByID({_id: role}).then(role=>{
        if(!role){
            return res.status(400).json({
                "status": false,
                "errors": [
                  {
                    "param": "role",
                    "message": "Role not found.",
                    "code": "RESOURCE_NOT_FOUND"
                  }
                ]
              });
        }
    });
    await Member.create({
        community: community,
        user: user,
        role:role
    }).then((member)=>{
        const formattedData = {
            id: member._id.toString(),
            community: member.community.toString(),
            user : member.user.toString(),
            role:member.role.toString(),
            created_at: member.createdAt
        }
        return res.status(200).json(
        {
            "status": true,
            "content": {
              "data": formattedData
            }
          });
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
