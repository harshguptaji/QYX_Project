import CareerApplication, {
  CAREER_STATUSES,
} from "../models/careerApplicationModel.js";

const isValidId = (value) =>
  typeof value === "string" &&
  /^[a-fA-F0-9]{24}$/.test(value);

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const populateAdmins = (query) =>
  query
    .populate("readBy", "adminName adminRole")
    .populate("reviewedBy", "adminName adminRole");

const handleError = (res, error, label) => {
  console.error(`${label}:`, error);

  if (error.name === "ValidationError") {
    return res.status(400).json({
      message: Object.values(error.errors)
        .map((item) => item.message)
        .join(", "),
      success: false,
    });
  }

  return res.status(500).json({
    message: "Internal server error.",
    success: false,
  });
};

// PUBLIC: submit career application
// POST /api/career/register
export const createCareerApplication = async (req, res) => {
  try {
    const body = req.body ?? {};
    const data = {};

    const requiredFields = {
      name: 100,
      email: 254,
      mobile: 10,
      interest: 150,
      message: 2500,
    };

    for (const [field, maxLength] of Object.entries(requiredFields)) {
      if (
        typeof body[field] !== "string" ||
        !body[field].trim() ||
        body[field].trim().length > maxLength
      ) {
        return res.status(400).json({
          message:
            `${field} is required and must not exceed ` +
            `${maxLength} characters.`,
          success: false,
        });
      }

      data[field] = body[field].trim();
    }

    data.email = data.email.toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return res.status(400).json({
        message: "Enter a valid email address.",
        success: false,
      });
    }

    if (!/^[6-9]\d{9}$/.test(data.mobile)) {
      return res.status(400).json({
        message: "Enter a valid 10-digit Indian mobile number.",
        success: false,
      });
    }

    if (body.experience !== undefined) {
      const allowedExperience = [
        "",
        "Student / Fresher",
        "Less than 1 year",
        "1–3 years",
        "3–5 years",
        "5+ years",
      ];

      if (!allowedExperience.includes(body.experience)) {
        return res.status(400).json({
          message: "Invalid experience selection.",
          success: false,
        });
      }

      data.experience = body.experience;
    }

    if (body.profileUrl !== undefined) {
      if (
        typeof body.profileUrl !== "string" ||
        body.profileUrl.trim().length > 1000
      ) {
        return res.status(400).json({
          message: "Enter a valid profile URL.",
          success: false,
        });
      }

      data.profileUrl = body.profileUrl.trim();

      if (data.profileUrl) {
        let validUrl = false;

        try {
          validUrl = ["http:", "https:"].includes(
            new URL(data.profileUrl).protocol
          );
        } catch {
          validUrl = false;
        }

        if (!validUrl) {
          return res.status(400).json({
            message: "Profile URL must start with http:// or https://.",
            success: false,
          });
        }
      }
    }

    // Admin-only fields are never accepted from public input.
    const application = await CareerApplication.create(data);

    return res.status(201).json({
      message: "Your career enquiry has been submitted successfully.",
      success: true,
      applicationId: application._id,
    });
  } catch (error) {
    return handleError(res, error, "Create career application error");
  }
};

// ADMIN: list with backend pagination and filters
// GET /api/accios/careers
export const getAllCareerApplications = async (req, res) => {
  try {
    const {
      page = "1",
      limit = "15",
      search = "",
      status = "all",
      readStatus = "all",
      experience = "",
      sort = "newest",
    } = req.query;

    if (
      [page, limit, search, status, readStatus, experience, sort].some(
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

    if (status !== "all" && !CAREER_STATUSES.includes(status)) {
      return res.status(400).json({
        message: "Invalid application status.",
        success: false,
      });
    }

    if (!["all", "read", "unread"].includes(readStatus)) {
      return res.status(400).json({
        message: "Read status must be all, read or unread.",
        success: false,
      });
    }

    const allowedExperience = [
      "",
      "Student / Fresher",
      "Less than 1 year",
      "1–3 years",
      "3–5 years",
      "5+ years",
    ];

    if (!allowedExperience.includes(experience)) {
      return res.status(400).json({
        message: "Invalid experience filter.",
        success: false,
      });
    }

    const sortOptions = {
      newest: { createdAt: -1, _id: -1 },
      oldest: { createdAt: 1, _id: 1 },
      nameAsc: { name: 1, _id: 1 },
      nameDesc: { name: -1, _id: -1 },
    };

    if (!Object.hasOwn(sortOptions, sort)) {
      return res.status(400).json({
        message: "Invalid sort option.",
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

    const filter = {};

    if (status !== "all") {
      filter.status = status;
    }

    if (readStatus !== "all") {
      filter.isRead = readStatus === "read";
    }

    if (experience) {
      filter.experience = experience;
    }

    if (query) {
      const expression = {
        $regex: escapeRegex(query),
        $options: "i",
      };

      filter.$or = [
        { name: expression },
        { email: expression },
        { mobile: expression },
        { interest: expression },
        { message: expression },
      ];
    }

    const total = await CareerApplication.countDocuments(filter);
    const totalPages = Math.max(1, Math.ceil(total / pageLimit));
    const currentPage = Math.min(requestedPage, totalPages);

    const applications = await CareerApplication.find(filter)
      .select(
        "name email mobile interest experience profileUrl " +
        "isRead status readAt createdAt updatedAt"
      )
      .sort(sortOptions[sort])
      .skip((currentPage - 1) * pageLimit)
      .limit(pageLimit)
      .lean();

    res.set("Cache-Control", "no-store");

    return res.status(200).json({
      message: "Career applications fetched successfully.",
      success: true,
      applications,
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
    return handleError(res, error, "List career applications error");
  }
};

// ADMIN: details — does not automatically mark as read
// GET /api/accios/careers/:applicationId
export const getCareerApplicationById = async (req, res) => {
  try {
    const { applicationId } = req.params;

    if (!isValidId(applicationId)) {
      return res.status(400).json({
        message: "Invalid application ID.",
        success: false,
      });
    }

    const application = await populateAdmins(
      CareerApplication.findById(applicationId)
    ).lean();

    if (!application) {
      return res.status(404).json({
        message: "Career application not found.",
        success: false,
      });
    }

    res.set("Cache-Control", "no-store");

    return res.status(200).json({
      message: "Career application fetched successfully.",
      success: true,
      application,
    });
  } catch (error) {
    return handleError(res, error, "Career application details error");
  }
};

// ADMIN: mark read — preserves the first reader
// PATCH /api/accios/careers/:applicationId/read
export const markCareerApplicationRead = async (req, res) => {
  try {
    const { applicationId } = req.params;

    if (!isValidId(applicationId)) {
      return res.status(400).json({
        message: "Invalid application ID.",
        success: false,
      });
    }

    if (!req.admin?._id) {
      return res.status(401).json({
        message: "Admin authentication required.",
        success: false,
      });
    }

    let application = await populateAdmins(
      CareerApplication.findOneAndUpdate(
        {
          _id: applicationId,
          isRead: false,
        },
        {
          $set: {
            isRead: true,
            readAt: new Date(),
            readBy: req.admin._id,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      )
    );

    if (!application) {
      application = await populateAdmins(
        CareerApplication.findById(applicationId)
      );
    }

    if (!application) {
      return res.status(404).json({
        message: "Career application not found.",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Application marked as read.",
      success: true,
      application,
    });
  } catch (error) {
    return handleError(res, error, "Mark career application read error");
  }
};

// ADMIN: mark unread
// PATCH /api/accios/careers/:applicationId/unread
export const markCareerApplicationUnread = async (req, res) => {
  try {
    const { applicationId } = req.params;

    if (!isValidId(applicationId)) {
      return res.status(400).json({
        message: "Invalid application ID.",
        success: false,
      });
    }

    const application = await populateAdmins(
      CareerApplication.findByIdAndUpdate(
        applicationId,
        {
          $set: {
            isRead: false,
            readAt: null,
            readBy: null,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      )
    );

    if (!application) {
      return res.status(404).json({
        message: "Career application not found.",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Application marked as unread.",
      success: true,
      application,
    });
  } catch (error) {
    return handleError(res, error, "Mark career application unread error");
  }
};

// ADMIN: update hiring status and/or internal notes
// PATCH /api/accios/careers/:applicationId/review
export const reviewCareerApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, adminNotes } = req.body ?? {};

    if (!isValidId(applicationId)) {
      return res.status(400).json({
        message: "Invalid application ID.",
        success: false,
      });
    }

    if (!req.admin?._id) {
      return res.status(401).json({
        message: "Admin authentication required.",
        success: false,
      });
    }

    const updates = {};

    if (status !== undefined) {
      if (!CAREER_STATUSES.includes(status)) {
        return res.status(400).json({
          message: "Invalid application status.",
          success: false,
        });
      }

      updates.status = status;
    }

    if (adminNotes !== undefined) {
      if (
        typeof adminNotes !== "string" ||
        adminNotes.trim().length > 5000
      ) {
        return res.status(400).json({
          message: "Admin notes must not exceed 5000 characters.",
          success: false,
        });
      }

      updates.adminNotes = adminNotes.trim();
    }

    if (!Object.keys(updates).length) {
      return res.status(400).json({
        message: "Provide a status or admin notes to update.",
        success: false,
      });
    }

    updates.reviewedAt = new Date();
    updates.reviewedBy = req.admin._id;

    const application = await populateAdmins(
      CareerApplication.findByIdAndUpdate(
        applicationId,
        { $set: updates },
        {
          new: true,
          runValidators: true,
        }
      )
    );

    if (!application) {
      return res.status(404).json({
        message: "Career application not found.",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Application review updated successfully.",
      success: true,
      application,
    });
  } catch (error) {
    return handleError(res, error, "Review career application error");
  }
};

// ADMIN: overall dashboard statistics
// GET /api/accios/careers/stats
export const getCareerApplicationStats = async (req, res) => {
  try {
    const [result] = await CareerApplication.aggregate([
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                unread: {
                  $sum: {
                    $cond: [{ $eq: ["$isRead", false] }, 1, 0],
                  },
                },
                read: {
                  $sum: {
                    $cond: [{ $eq: ["$isRead", true] }, 1, 0],
                  },
                },
              },
            },
          ],
          statuses: [
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ]);

    const totals = result?.totals?.[0];

    const byStatus = Object.fromEntries(
      CAREER_STATUSES.map((status) => [status, 0])
    );

    for (const item of result?.statuses || []) {
      if (Object.hasOwn(byStatus, item._id)) {
        byStatus[item._id] = item.count;
      }
    }

    res.set("Cache-Control", "no-store");

    return res.status(200).json({
      success: true,
      stats: {
        total: totals?.total || 0,
        read: totals?.read || 0,
        unread: totals?.unread || 0,
        byStatus,
      },
    });
  } catch (error) {
    return handleError(res, error, "Career statistics error");
  }
};