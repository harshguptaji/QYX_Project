import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import Admin from "../models/adminModel.js";

import {
  ADMIN_COOKIE_NAME,
  getAdminCookieOptions,
} from "../utils/adminCookie.js";

const ADMIN_SESSION_SECONDS = 8 * 60 * 60;

const serializeAdmin = (admin) => ({
  id: admin._id,
  adminName: admin.adminName,
  adminEmail: admin.adminEmail,
  adminMobile: admin.adminMobile,
  adminRole: admin.adminRole,
});


// POST /api/admin/register
export const adminRegister = async (req, res) => {
  try {
    const {
      adminName,
      adminEmail,
      adminMobile,
      adminPassword,
      adminRole = "Sub-Admin",
    } = req.body ?? {};

    if (
      typeof adminName !== "string" ||
      typeof adminEmail !== "string" ||
      typeof adminMobile !== "string" ||
      typeof adminPassword !== "string"
    ) {
      return res.status(400).json({
        message: "Name, email, mobile and password are required.",
        success: false,
      });
    }

    const name = adminName.trim();
    const email = adminEmail.trim().toLowerCase();
    const mobile = adminMobile.trim();

    if (!name || name.length > 100) {
      return res.status(400).json({
        message: "Name must contain between 1 and 100 characters.",
        success: false,
      });
    }

    if (
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return res.status(400).json({
        message: "Enter a valid email address.",
        success: false,
      });
    }

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return res.status(400).json({
        message: "Enter a valid 10-digit Indian mobile number.",
        success: false,
      });
    }

    // bcrypt uses at most 72 bytes of a password.
    if (
      adminPassword.length < 8 ||
      Buffer.byteLength(adminPassword, "utf8") > 72
    ) {
      return res.status(400).json({
        message:
          "Password must contain at least 8 characters and must not exceed 72 bytes.",
        success: false,
      });
    }

    if (!["Root", "Admin", "Sub-Admin"].includes(adminRole)) {
      return res.status(400).json({
        message: "Invalid admin role.",
        success: false,
      });
    }

    const existingAdmin = await Admin.exists({
      $or: [
        { adminEmail: email },
        { adminMobile: mobile },
      ],
    });

    if (existingAdmin) {
      return res.status(409).json({
        message: "An admin with this email or mobile already exists.",
        success: false,
      });
    }

    const admin = await Admin.create({
      adminName: name,
      adminEmail: email,
      adminMobile: mobile,
      adminPassword,
      adminRole,
    });

    // The corrected model's pre-save middleware hashes the password.
    return res.status(201).json({
      message: "Admin registered successfully.",
      success: true,
      admin: {
        id: admin._id,
        adminName: admin.adminName,
        adminEmail: admin.adminEmail,
        adminMobile: admin.adminMobile,
        adminRole: admin.adminRole,
        createdAt: admin.createdAt,
      },
    });
  } catch (error) {
    console.error("Admin registration error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "An admin with these details already exists.",
        success: false,
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: Object.values(error.errors)
          .map((item) => item.message)
          .join(", "),
        success: false,
      });
    }

    return res.status(500).json({
      message: "Unable to register admin. Please try again.",
      success: false,
    });
  }
};

// POST /api/admin/login
export const adminLogin = async (req, res) => {
  try {
    const { adminEmail, adminPassword } = req.body ?? {};

    if (
      typeof adminEmail !== "string" ||
      typeof adminPassword !== "string" ||
      !adminEmail.trim() ||
      !adminPassword
    ) {
      return res.status(400).json({
        message: "Email and password are required.",
        success: false,
      });
    }

    const admin = await Admin.findOne({
      adminEmail: adminEmail.trim().toLowerCase(),
    }).select("+adminPassword");

    // Use the same response for an unknown email or wrong password.
    if (!admin) {
      return res.status(401).json({
        message: "Invalid admin email or password.",
        success: false,
      });
    }

    const passwordMatched = await bcrypt.compare(adminPassword,admin.adminPassword);

    if (!passwordMatched) {
      return res.status(401).json({
        message: "Invalid admin email or password.",
        success: false,
      });
    }

    const token = jwt.sign(
      {
        type: "admin",
      },
      process.env.JWT_ADMIN_SECRET,
      {
        subject: String(admin._id),
        issuer: "qyx-api",
        audience: "qyx-admin",
        algorithm: "HS256",
        expiresIn: ADMIN_SESSION_SECONDS,
      }
    );

    res.set("Cache-Control", "no-store");

    res.cookie(ADMIN_COOKIE_NAME, token, {
      ...getAdminCookieOptions(),
      maxAge: ADMIN_SESSION_SECONDS * 1000,
    });

    return res.status(200).json({
      message: "Admin login successful.",
      success: true,
      admin: serializeAdmin(admin),
      redirectTo: "/accios",
    });
  } catch (error) {
    console.error("Admin login error:", error);

    return res.status(500).json({
      message: "Unable to log in. Please try again.",
      success: false,
    });
  }
};

//

// GET /api/admin/me
export const adminMe = async (req, res) => {
  res.set("Cache-Control", "no-store");

  return res.status(200).json({
    success: true,
    admin: serializeAdmin(req.admin),
  });
};

// POST /api/admin/logout
export const adminLogout = async (_, res) => {
  res.clearCookie(
    ADMIN_COOKIE_NAME,
    getAdminCookieOptions()
  );

  return res.status(200).json({
    message: "Admin logout successful.",
    success: true,
  });
};

// Edit admin.
export const adminEdit = async (req, res) => {
  try {
    const { adminId } = req.params;
    const body = req.body ?? {};

    if (!/^[a-fA-F0-9]{24}$/.test(adminId)) {
      return res.status(400).json({
        message: "Invalid admin ID.",
        success: false,
      });
    }

    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({
        message: "Admin not found.",
        success: false,
      });
    }

    const updates = {};

    if (body.adminName !== undefined) {
      if (
        typeof body.adminName !== "string" ||
        !body.adminName.trim() ||
        body.adminName.trim().length > 100
      ) {
        return res.status(400).json({
          message: "Name must contain between 1 and 100 characters.",
          success: false,
        });
      }

      updates.adminName = body.adminName.trim();
    }

    if (body.adminEmail !== undefined) {
      if (typeof body.adminEmail !== "string") {
        return res.status(400).json({
          message: "Enter a valid email address.",
          success: false,
        });
      }

      const email = body.adminEmail.trim().toLowerCase();

      if (
        email.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ) {
        return res.status(400).json({
          message: "Enter a valid email address.",
          success: false,
        });
      }

      updates.adminEmail = email;
    }

    if (body.adminMobile !== undefined) {
      if (
        typeof body.adminMobile !== "string" ||
        !/^[6-9]\d{9}$/.test(body.adminMobile.trim())
      ) {
        return res.status(400).json({
          message: "Enter a valid 10-digit Indian mobile number.",
          success: false,
        });
      }

      updates.adminMobile = body.adminMobile.trim();
    }

    if (body.adminRole !== undefined) {
      if (!["Root", "Admin", "Sub-Admin"].includes(body.adminRole)) {
        return res.status(400).json({
          message: "Invalid admin role.",
          success: false,
        });
      }

      if (
        admin.adminRole === "Root" &&
        body.adminRole !== "Root"
      ) {
        return res.status(400).json({
          message: "Root accounts cannot be demoted through this endpoint.",
          success: false,
        });
      }

      updates.adminRole = body.adminRole;
    }

    if (body.adminPassword !== undefined) {
      if (
        typeof body.adminPassword !== "string" ||
        body.adminPassword.length < 8 ||
        Buffer.byteLength(body.adminPassword, "utf8") > 72
      ) {
        return res.status(400).json({
          message:
            "Password must contain at least 8 characters and must not exceed 72 bytes.",
          success: false,
        });
      }

      updates.adminPassword = body.adminPassword;
    }

    if (!Object.keys(updates).length) {
      return res.status(400).json({
        message: "Provide information to update.",
        success: false,
      });
    }

    Object.assign(admin, updates);

    // Runs the model's password hashing middleware.
    await admin.save();

    return res.status(200).json({
      message: "Admin updated successfully.",
      success: true,
      passwordChanged: body.adminPassword !== undefined,
      admin: {
        id: admin._id,
        adminName: admin.adminName,
        adminEmail: admin.adminEmail,
        adminMobile: admin.adminMobile,
        adminRole: admin.adminRole,
        updatedAt: admin.updatedAt,
      },
    });
  } catch (error) {
    console.error("Admin edit error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "An admin with these details already exists.",
        success: false,
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: Object.values(error.errors)
          .map((item) => item.message)
          .join(", "),
        success: false,
      });
    }

    return res.status(500).json({
      message: "Unable to update admin.",
      success: false,
    });
  }
};

// Delete admin without password confirmation
export const adminDelete = async (req, res) => {
  try {
    const { adminId } = req.params;

    if (!/^[a-fA-F0-9]{24}$/.test(adminId)) {
      return res.status(400).json({
        message: "Invalid admin ID.",
        success: false,
      });
    }

    if (String(req.admin._id) === adminId.toLowerCase()) {
      return res.status(400).json({
        message: "You cannot delete your own admin account.",
        success: false,
      });
    }

    const deletedAdmin = await Admin.findOneAndDelete({
      _id: adminId,
      adminRole: { $in: ["Admin", "Sub-Admin"] },
    });

    if (!deletedAdmin) {
      return res.status(400).json({
        message: "Account does not exist or is a protected Root account.",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Admin deleted successfully.",
      success: true,
      adminId: deletedAdmin._id,
    });
  } catch (error) {
    console.error("Admin delete error:", error);

    return res.status(500).json({
      message: "Unable to delete admin.",
      success: false,
    });
  }
};

// GET /api/admin/accounts/:adminId
export const adminById = async (req, res) => {
  try {
    const { adminId } = req.params;

    if (!/^[a-fA-F0-9]{24}$/.test(adminId)) {
      return res.status(400).json({
        message: "Invalid admin ID.",
        success: false,
      });
    }

    const admin = await Admin.findById(adminId)
      .select(
        "_id adminName adminEmail adminMobile adminRole createdAt updatedAt"
      )
      .lean();

    if (!admin) {
      return res.status(404).json({
        message: "Admin not found.",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Admin information fetched successfully.",
      success: true,
      admin: {
        id: admin._id,
        adminName: admin.adminName,
        adminEmail: admin.adminEmail,
        adminMobile: admin.adminMobile,
        adminRole: admin.adminRole,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
      },
    });
  } catch (error) {
    console.error("Admin details error:", error);

    return res.status(500).json({
      message: "Unable to fetch admin information.",
      success: false,
    });
  }
};

// GET all admins
export const allAdmins = async (req, res) => {
  try {
    const {
      search = "",
      role = "all",
      page = "1",
      limit = "15",
      sort = "newest",
    } = req.query;

    // Reject arrays, objects and invalid query types.
    if (
      [search, role, page, limit, sort].some(
        (value) => typeof value !== "string"
      )
    ) {
      return res.status(400).json({
        message: "Invalid query parameters.",
        success: false,
      });
    }

    if (
      !/^[1-9]\d*$/.test(page) ||
      !/^[1-9]\d*$/.test(limit)
    ) {
      return res.status(400).json({
        message: "Page and limit must be positive integers.",
        success: false,
      });
    }

    const requestedPage = Number(page);
    const pageLimit = Number(limit);

    if (
      !Number.isSafeInteger(requestedPage) ||
      !Number.isSafeInteger(pageLimit) ||
      pageLimit > 100
    ) {
      return res.status(400).json({
        message: "Invalid pagination. Limit must be between 1 and 100.",
        success: false,
      });
    }

    const query = search.trim();

    if (query.length > 100) {
      return res.status(400).json({
        message: "Search must not exceed 100 characters.",
        success: false,
      });
    }

    if (!["all", "Root", "Admin", "Sub-Admin"].includes(role)) {
      return res.status(400).json({
        message: "Invalid admin role filter.",
        success: false,
      });
    }

    const sortOptions = {
      newest: { createdAt: -1, _id: -1 },
      oldest: { createdAt: 1, _id: 1 },
      nameAsc: { adminName: 1, _id: 1 },
      nameDesc: { adminName: -1, _id: -1 },
    };

    if (!Object.hasOwn(sortOptions, sort)) {
      return res.status(400).json({
        message: "Invalid sort option.",
        success: false,
      });
    }

    const filter = {};

    if (role !== "all") {
      filter.adminRole = role;
    }

    if (query) {
      // Treat search input as literal text.
      const escapedSearch = query.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      filter.$or = [
        {
          adminName: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
        {
          adminEmail: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
        {
          adminMobile: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
      ];
    }

    const total = await Admin.countDocuments(filter);
    const totalPages = Math.max(1, Math.ceil(total / pageLimit));
    const currentPage = Math.min(requestedPage, totalPages);

    const admins = await Admin.find(filter)
      .select(
        "_id adminName adminEmail adminMobile adminRole createdAt updatedAt"
      )
      .sort(sortOptions[sort])
      .skip((currentPage - 1) * pageLimit)
      .limit(pageLimit)
      .lean();

    res.set("Cache-Control", "no-store");

    return res.status(200).json({
      message: "Admin accounts fetched successfully.",
      success: true,
      admins,
      pagination: {
        page: currentPage,
        limit: pageLimit,
        total,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },
    });
  } catch (error) {
    console.error("All admins controller error:", error);

    return res.status(500).json({
      message: "Unable to fetch admin accounts.",
      success: false,
    });
  }
};