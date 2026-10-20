import Contact from "../models/contactModel.js";

const isValidId = (value) =>
  typeof value === "string" &&
  /^[a-fA-F0-9]{24}$/.test(value);

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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

// Public: submit contact form
// POST /api/contact
export const createContact = async (req, res) => {
  try {
    const body = req.body ?? {};

    const rules = {
      name: 100,
      email: 254,
      mobile: 10,
      purpose: 150,
      message: 5000,
    };

    const data = {};

    for (const [field, maxLength] of Object.entries(rules)) {
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

    // Never accept isRead, readAt or readBy from public input.
    const contact = await Contact.create(data);

    return res.status(201).json({
      message: "Your message has been submitted successfully.",
      success: true,
      contactId: contact._id,
    });
  } catch (error) {
    return handleError(res, error, "Create contact error");
  }
};

// Admin: list messages
// GET /api/accios/contacts
export const getAllContacts = async (req, res) => {
  try {
    const {
      page = "1",
      limit = "15",
      search = "",
      status = "all",
      purpose = "",
      sort = "newest",
    } = req.query;

    if (
      [page, limit, search, status, purpose, sort].some(
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

    if (!["all", "read", "unread"].includes(status)) {
      return res.status(400).json({
        message: "Status must be all, read or unread.",
        success: false,
      });
    }

    if (!["newest", "oldest"].includes(sort)) {
      return res.status(400).json({
        message: "Sort must be newest or oldest.",
        success: false,
      });
    }

    const query = search.trim();
    const purposeFilter = purpose.trim();

    if (query.length > 100 || purposeFilter.length > 150) {
      return res.status(400).json({
        message: "Search or purpose filter is too long.",
        success: false,
      });
    }

    const filter = {};

    if (status !== "all") {
      filter.isRead = status === "read";
    }

    if (purposeFilter) {
      filter.purpose = {
        $regex: `^${escapeRegex(purposeFilter)}$`,
        $options: "i",
      };
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
        { purpose: expression },
        { message: expression },
      ];
    }

    const total = await Contact.countDocuments(filter);
    const totalPages = Math.max(1, Math.ceil(total / pageLimit));
    const currentPage = Math.min(requestedPage, totalPages);

    const direction = sort === "oldest" ? 1 : -1;

    const contacts = await Contact.find(filter)
      .select(
        "name email mobile purpose isRead readAt readBy createdAt updatedAt"
      )
      .populate("readBy", "adminName adminRole")
      .sort({
        createdAt: direction,
        _id: direction,
      })
      .skip((currentPage - 1) * pageLimit)
      .limit(pageLimit)
      .lean();

    res.set("Cache-Control", "no-store");

    return res.status(200).json({
      message: "Contact messages fetched successfully.",
      success: true,
      contacts,
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
    return handleError(res, error, "List contacts error");
  }
};

// Admin: view a message without changing its read status
// GET /api/accios/contacts/:contactId
export const getContactById = async (req, res) => {
  try {
    const { contactId } = req.params;

    if (!isValidId(contactId)) {
      return res.status(400).json({
        message: "Invalid contact ID.",
        success: false,
      });
    }

    const contact = await Contact.findById(contactId)
      .populate("readBy", "adminName adminRole")
      .lean();

    if (!contact) {
      return res.status(404).json({
        message: "Contact message not found.",
        success: false,
      });
    }

    res.set("Cache-Control", "no-store");

    return res.status(200).json({
      message: "Contact details fetched successfully.",
      success: true,
      contact,
    });
  } catch (error) {
    return handleError(res, error, "Contact details error");
  }
};

// Admin: mark as read
// PATCH /api/accios/contacts/:contactId/read
export const markContactAsRead = async (req, res) => {
  try {
    const { contactId } = req.params;

    if (!req.admin?._id) {
      return res.status(401).json({
        message: "Admin authentication required.",
        success: false,
      });
    }

    if (!isValidId(contactId)) {
      return res.status(400).json({
        message: "Invalid contact ID.",
        success: false,
      });
    }

    // Only the first reader changes the read metadata.
    let contact = await Contact.findOneAndUpdate(
      {
        _id: contactId,
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
    ).populate("readBy", "adminName adminRole");

    // An already-read message is also a successful request.
    if (!contact) {
      contact = await Contact.findById(contactId)
        .populate("readBy", "adminName adminRole");
    }

    if (!contact) {
      return res.status(404).json({
        message: "Contact message not found.",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Message marked as read.",
      success: true,
      contact,
    });
  } catch (error) {
    return handleError(res, error, "Mark contact as read error");
  }
};

// Admin: mark as unread
// PATCH /api/accios/contacts/:contactId/unread
export const markContactAsUnread = async (req, res) => {
  try {
    const { contactId } = req.params;

    if (!isValidId(contactId)) {
      return res.status(400).json({
        message: "Invalid contact ID.",
        success: false,
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      contactId,
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
    );

    if (!contact) {
      return res.status(404).json({
        message: "Contact message not found.",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Message marked as unread.",
      success: true,
      contact,
    });
  } catch (error) {
    return handleError(res, error, "Mark contact as unread error");
  }
};

// Admin: dashboard counts
// GET /api/accios/contacts/stats
export const getContactStats = async (req, res) => {
  try {
    const [result] = await Contact.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          read: {
            $sum: {
              $cond: [{ $eq: ["$isRead", true] }, 1, 0],
            },
          },
          unread: {
            $sum: {
              $cond: [{ $eq: ["$isRead", false] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          total: 1,
          read: 1,
          unread: 1,
        },
      },
    ]);

    res.set("Cache-Control", "no-store");

    return res.status(200).json({
      success: true,
      stats: result || {
        total: 0,
        read: 0,
        unread: 0,
      },
    });
  } catch (error) {
    return handleError(res, error, "Contact stats error");
  }
};