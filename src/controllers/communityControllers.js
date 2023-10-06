const Community = require("../models/community");
const Member = require("../models/member");
const User = require("../models/user");
const Role = require("../models/role");
require("dotenv").config();
const slugify = require("slugify");
const mongoose = require("mongoose");

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
      .then(async (doc) => {
        const role = await Role.findOne({ name: "Community Admin" });
        await Member.create({
          community: doc._id,
          user: req.user._id,
          role: role._id,
        });
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
    let page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const total = await Community.count();
    const totalPages = Math.ceil(total / pageSize);

    if (page > totalPages) page = 1;

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
    var page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const total = await Community.count();
    const totalPages = Math.ceil(total / pageSize);

    if (page > totalPages) page = 1;

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
    let page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const total = await Community.countDocuments({ owner: req.user._id });
    const totalPages = Math.ceil(total / pageSize);

    if (page > totalPages) page = 1;

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

    const pipeline = [
      {
        $match: {
          user: req.user._id,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: pageSize,
      },
      {
        $lookup: {
          from: "communities",
          localField: "community",
          foreignField: "_id",
          as: "communityDetails",
        },
      },
      {
        $unwind: "$communityDetails",
      },
      // {
      //   $lookup: {
      //     from: "users",
      //     localField: "communityDetails.owner",
      //     foreignField: "_id",
      //     as: "ownerDetails",
      //   },
      // },
      // {
      //   $unwind: "$ownerDetails",
      // },
      {
        $project: {
          _id: "$communityDetails._id",
          name: "$communityDetails.name",
          slug: "$communityDetails.slug",
          ownerId: "$ownerDetails._id",
          ownerName: "$ownerDetails.name",
          created_at: "$communityDetails.createdAt",
          updated_at: "$communityDetails.updatedAt",
        },
      },
    ];

    const result = await Member.aggregate(pipeline);

    const formattedData = result.map((ele) => ({
      id: ele._id.toString(),
      name: ele.name,
      slug: ele.slug,
      owner: {
        id: ele.ownerId,
        name: ele.ownerName,
      },
      created_at: ele.created_at,
      updated_at: ele.updated_at,
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

exports.isValidObjectId = function (stringId) {
  return mongoose.Types.ObjectId.isValid(stringId);
};

exports.addMember = async (req, res) => {
  try {
    if (req.userRole.name == "Community Admin") {
      const { community, user, role } = req.body;
      // check if user does not exist
      User.findOne({ _id: user }).then(async (user) => {
        if (!user) {
          return res.status(400).json({
            status: false,
            errors: [
              {
                param: "user",
                message: "User not found.",
                code: "RESOURCE_NOT_FOUND",
              },
            ],
          });
        } else {
          const userId = new mongoose.Types.ObjectId(user);
          const communityId = new mongoose.Types.ObjectId(community);
          // check if member already exist
          Member.findOne({
            $and: [{ community: communityId }, { user: userId }],
          }).then(async (existingMember) => {
            if (existingMember != null) {
              return res.status(400).json({
                status: false,
                errors: [
                  {
                    message: "User is already added in the community.",
                    code: "RESOURCE_EXISTS",
                  },
                ],
              });
            } else {
              // Check if the role exists
              Role.findById(role)
                .then(async (existingRole) => {
                  if (existingRole == null) {
                    return res.status(400).json({
                      status: false,
                      errors: [
                        {
                          param: "role",
                          message: "Role not found.",
                          code: "RESOURCE_NOT_FOUND",
                        },
                      ],
                    });
                  } else {
                    const communityId = new mongoose.Types.ObjectId(community);
                    const userId = new mongoose.Types.ObjectId(user);
                    const roleId = new mongoose.Types.ObjectId(role);

                    // Create a new member
                    const newMember = await Member.create({
                      community: communityId,
                      user: userId,
                      role: roleId,
                    });

                    const formattedData = {
                      id: newMember._id.toString(),
                      community: newMember.community.toString(),
                      user: newMember.user.toString(),
                      role: newMember.role.toString(),
                      created_at: newMember.createdAt,
                    };

                    return res.status(200).json({
                      status: true,
                      content: {
                        data: formattedData,
                      },
                    });
                  }
                })
                .catch((err) => {
                  return res.status(400).json({
                    status: false,
                    errors: [
                      {
                        param: "role",
                        message: "Role not found.",
                        code: "RESOURCE_NOT_FOUND",
                      },
                    ],
                  });
                });
            }
          });
        }
      });
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

exports.removeMember = async (req, res) => {
  try {
    const member = new mongoose.Types.ObjectId(req.params.id);
    const user = new mongoose.Types.ObjectId(req.user._id);

    const pipeline = [
      {
        $match: {
          user: member,
        },
      },
      {
        $lookup: {
          from: "members",
          localField: "community",
          foreignField: "community",
          as: "doc2",
        },
      },
      {
        $unwind: "$doc2",
      },
      {
        $match: {
          "doc2.user": user,
        },
      },
      {
        $lookup: {
          from: "roles",
          localField: "doc2.role",
          foreignField: "_id",
          as: "roleDetails",
        },
      },
      {
        $unwind: "$roleDetails",
      },
      {
        $match: {
          "roleDetails.name": {
            $in: ["Community Admin", "Community Moderator"],
          },
        },
      },
      {
        $project: {
          _id: 1,
          user: 1,
        },
      },
    ];

    Member.aggregate(pipeline)
      .exec()
      .then(async (result) => {
        if (result.length == 0) {
          return res.status(400).json({
            status: false,
            errors: [
              {
                message: "Member not found.",
                code: "RESOURCE_NOT_FOUND",
              },
            ],
          });
        } else {
          // Extract the _id values of the documents to be deleted
          const docIdsToDelete = result.map((doc) => doc._id);

          // Delete the documents from the Member table
          await Member.deleteMany({ _id: { $in: docIdsToDelete } });
          return res.status(200).json({
            status: true,
          });
        }
      })
      .catch((error) => {
        console.error(error);
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
