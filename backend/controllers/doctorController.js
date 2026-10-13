import Doctor from "../models/doctorModel.js";
import User from "../models/userModel.js";

import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinaryUpload.js";

import mongoose from "mongoose";
import path from "path";
import cloudinary from "../config/cloudinary.js";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

const parseJSONField = (value, fieldName, fallback) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    const error = new Error(`${fieldName} must contain valid JSON.`);

    error.statusCode = 400;
    throw error;
  }
};

const ensureArray = (value, fieldName) => {
  if (!Array.isArray(value)) {
    const error = new Error(`${fieldName} must be an array.`);

    error.statusCode = 400;
    throw error;
  }

  return value;
};

const numberValue = (value, fieldName) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    const error = new Error(`${fieldName} must be a valid number.`);

    error.statusCode = 400;
    throw error;
  }

  return parsedValue;
};

const normalizeIndianMobile = (mobile) => {
  const digits = String(mobile || "").replace(/\D/g, "");

  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }

  if (digits.length === 10) {
    return digits;
  }

  const error = new Error(
    "Please enter a valid 10-digit Indian mobile number.",
  );

  error.statusCode = 400;
  throw error;
};

const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
};

const validateWeeklySchedule = (weeklySchedule) => {
  if (!Array.isArray(weeklySchedule)) {
    const error = new Error("doctorWeeklySchedule must be an array.");

    error.statusCode = 400;
    throw error;
  }

  if (weeklySchedule.length !== 7) {
    const error = new Error("Weekly schedule must contain all seven days.");

    error.statusCode = 400;
    throw error;
  }

  const scheduleDays = weeklySchedule.map((schedule) => schedule.day);

  const uniqueDays = new Set(scheduleDays);

  if (uniqueDays.size !== 7) {
    const error = new Error("Weekly schedule cannot contain duplicate days.");

    error.statusCode = 400;
    throw error;
  }

  const invalidDay = scheduleDays.find((day) => !DAYS.includes(day));

  if (invalidDay) {
    const error = new Error(`${invalidDay} is not a valid schedule day.`);

    error.statusCode = 400;
    throw error;
  }

  for (const schedule of weeklySchedule) {
    if (!schedule.isEnabled) {
      schedule.scheduleStart = null;
      schedule.scheduleEnd = null;
      schedule.breakTimes = [];
      continue;
    }

    if (
      !TIME_PATTERN.test(schedule.scheduleStart || "") ||
      !TIME_PATTERN.test(schedule.scheduleEnd || "")
    ) {
      const error = new Error(
        `${schedule.day} schedule time must use HH:mm format.`,
      );

      error.statusCode = 400;
      throw error;
    }

    const scheduleStart = timeToMinutes(schedule.scheduleStart);

    const scheduleEnd = timeToMinutes(schedule.scheduleEnd);

    if (scheduleStart >= scheduleEnd) {
      const error = new Error(
        `${schedule.day} schedule start must be earlier than schedule end.`,
      );

      error.statusCode = 400;
      throw error;
    }

    if (schedule.breakTimes === undefined) {
      schedule.breakTimes = [];
    }

    if (!Array.isArray(schedule.breakTimes)) {
      const error = new Error(`${schedule.day} breakTimes must be an array.`);

      error.statusCode = 400;
      throw error;
    }

    const parsedBreaks = [];

    for (const breakTime of schedule.breakTimes) {
      if (
        !TIME_PATTERN.test(breakTime.breakStart || "") ||
        !TIME_PATTERN.test(breakTime.breakEnd || "")
      ) {
        const error = new Error(
          `${schedule.day} break time must use HH:mm format.`,
        );

        error.statusCode = 400;
        throw error;
      }

      const breakStart = timeToMinutes(breakTime.breakStart);

      const breakEnd = timeToMinutes(breakTime.breakEnd);

      if (breakStart >= breakEnd) {
        const error = new Error(
          `${schedule.day} break start must be earlier than break end.`,
        );

        error.statusCode = 400;
        throw error;
      }

      if (breakStart < scheduleStart || breakEnd > scheduleEnd) {
        const error = new Error(
          `${schedule.day} break must be inside consultation hours.`,
        );
        error.statusCode = 400;
        throw error;
      }

      parsedBreaks.push({ start: breakStart, end: breakEnd });
    }

    parsedBreaks.sort((first, second) => first.start - second.start);

    for (let index = 1; index < parsedBreaks.length; index += 1) {
      if (parsedBreaks[index].start < parsedBreaks[index - 1].end) {
        const error = new Error(
          `${schedule.day} contains overlapping break times.`,
        );
        error.statusCode = 400;
        throw error;
      }
    }
  }

  return weeklySchedule;
};

export const createDoctor = async (req, res) => {
  const uploadedAssets = [];

  let createdDoctor = null;

  try {
    const {
      doctorName,
      doctorEmail,
      doctorMobile,
      doctorGender,
      doctorDOB,
      doctorCity,
      doctorState,
      doctorCountry,
      doctorSpecialization,
      doctorExperience,
      doctorMedicalNumber,
      doctorRegistrationCouncil,
      doctorQualification,
      doctorBiography,
      doctorConsultationFee,
      doctorConsultationDuration,
      doctorSlotDuration,
      doctorMaxAppointments,
      doctorScheduleEffectiveFrom,
      doctorConsultationInstruction,
    } = req.body;

    const requiredFields = {
      doctorName,
      doctorEmail,
      doctorMobile,
      doctorGender,
      doctorDOB,
      doctorCity,
      doctorState,
      doctorCountry,
      doctorSpecialization,
      doctorExperience,
      doctorMedicalNumber,
      doctorRegistrationCouncil,
      doctorQualification,
      doctorBiography,
      doctorConsultationFee,
      doctorConsultationDuration,
      doctorSlotDuration,
      doctorMaxAppointments,
      doctorConsultationInstruction,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(
        ([, value]) =>
          value === undefined || value === null || String(value).trim() === "",
      )
      .map(([fieldName]) => fieldName);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`,
        success: false,
      });
    }

    const normalizedEmail = doctorEmail.trim().toLowerCase();

    const normalizedMobile = normalizeIndianMobile(doctorMobile);

    const requiredFileFields = [
      "doctorPhoto",
      "doctorRegistrationCertificate",
      "doctorQualificationCertificate",
      "doctorGovernmentId",
    ];

    const missingFiles = requiredFileFields.filter(
      (fieldName) => !req.files?.[fieldName]?.[0],
    );

    if (missingFiles.length > 0) {
      return res.status(400).json({
        message: `Missing required files: ${missingFiles.join(", ")}`,
        success: false,
      });
    }

    const existingDoctor = await Doctor.findOne({
      $or: [
        {
          doctorEmail: normalizedEmail,
        },
        {
          doctorMobile: normalizedMobile,
        },
        {
          doctorMedicalNumber: doctorMedicalNumber.trim(),
        },
      ],
    });

    if (existingDoctor) {
      return res.status(409).json({
        message:
          "A doctor already exists with this email, mobile number or medical registration number.",
        success: false,
      });
    }

    const user = await User.findOne({
      userEmail: normalizedEmail,

      userMobile: {
        $in: [normalizedMobile, `+91${normalizedMobile}`],
      },
    });

    if (!user) {
      return res.status(400).json({
        message:
          "A registered user with the same email and mobile number was not found.",
        success: false,
      });
    }

    const existingUserDoctor = await Doctor.findOne({ userId: user._id });

    if (existingUserDoctor) {
      return res.status(409).json({
        message: "This user already has a doctor profile.",
        success: false,
      });
    }

    const additionalSpecializations = ensureArray(
      parseJSONField(
        req.body.doctorAdditionalSpecializations,
        "doctorAdditionalSpecializations",
        [],
      ),
      "doctorAdditionalSpecializations",
    );

    const languages = ensureArray(
      parseJSONField(req.body.doctorLanguages, "doctorLanguages", []),
      "doctorLanguages",
    );

    if (languages.length === 0) {
      return res.status(400).json({
        message: "At least one doctor language is required.",
        success: false,
      });
    }

    const weeklyScheduleValue = parseJSONField(
      req.body.doctorWeeklySchedule,
      "doctorWeeklySchedule",
      undefined,
    );

    const weeklySchedule =
      weeklyScheduleValue === undefined
        ? undefined
        : validateWeeklySchedule(
            ensureArray(weeklyScheduleValue, "doctorWeeklySchedule"),
          );

    const unavailableDates = ensureArray(
      parseJSONField(
        req.body.doctorUnavailableDates,
        "doctorUnavailableDates",
        [],
      ),
      "doctorUnavailableDates",
    );

    const uploadDefinitions = [
      {
        field: "doctorPhoto",
        folder: "doctors/photos",
        isPrivate: false,
      },
      {
        field: "doctorRegistrationCertificate",
        folder: "doctors/registration-certificates",
        isPrivate: true,
      },
      {
        field: "doctorQualificationCertificate",
        folder: "doctors/qualification-certificates",
        isPrivate: true,
      },
      {
        field: "doctorGovernmentId",
        folder: "doctors/government-ids",
        isPrivate: true,
      },
      {
        field: "doctorSupportingDocument",
        folder: "doctors/supporting-documents",
        isPrivate: true,
      },
    ];

    const uploadedFiles = {};

    for (const definition of uploadDefinitions) {
      const file = req.files?.[definition.field]?.[0];

      if (!file) {
        continue;
      }

      const uploadedAsset = await uploadToCloudinary({
        file,
        folder: definition.folder,
        isPrivate: definition.isPrivate,
      });
      uploadedAssets.push(uploadedAsset);
      uploadedFiles[definition.field] = uploadedAsset;
    }

    const doctorData = {
      userId: user._id,
      doctorName: doctorName.trim(),
      doctorPhoto: uploadedFiles.doctorPhoto,
      doctorEmail: normalizedEmail,
      doctorMobile: normalizedMobile,
      doctorGender,
      doctorDOB,
      doctorCity: doctorCity.trim(),
      doctorState: doctorState.trim(),
      doctorCountry: doctorCountry.trim(),
      doctorSpecialization: doctorSpecialization.trim(),
      doctorExperience: numberValue(doctorExperience, "doctorExperience"),
      doctorMedicalNumber: doctorMedicalNumber.trim(),
      doctorRegistrationCouncil: doctorRegistrationCouncil.trim(),
      doctorQualification: doctorQualification.trim(),
      doctorAdditionalSpecializations: additionalSpecializations,
      doctorLanguages: languages,
      doctorBiography: doctorBiography.trim(),
      doctorConsultationFee: numberValue(
        doctorConsultationFee,
        "doctorConsultationFee",
      ),
      doctorConsultationDuration: numberValue(
        doctorConsultationDuration,
        "doctorConsultationDuration",
      ),
      doctorSlotDuration: numberValue(doctorSlotDuration, "doctorSlotDuration"),
      doctorMaxAppointments: numberValue(
        doctorMaxAppointments,
        "doctorMaxAppointments",
      ),
      doctorScheduleEffectiveFrom: doctorScheduleEffectiveFrom || undefined,
      doctorUnavailableDates: unavailableDates,
      doctorConsultationInstruction: doctorConsultationInstruction.trim(),
      doctorRegistrationCertificate:
        uploadedFiles.doctorRegistrationCertificate,
      doctorQualificationCertificate:
        uploadedFiles.doctorQualificationCertificate,
      doctorGovernmentId: uploadedFiles.doctorGovernmentId,
      doctorSupportingDocument: uploadedFiles.doctorSupportingDocument || null,
    };

    if (weeklySchedule !== undefined) {
      doctorData.doctorWeeklySchedule = weeklySchedule;
    }

    createdDoctor = new Doctor(doctorData);

    await createdDoctor.save();

    /*
     * Keep the user role unchanged while the
     * doctor profile is Pending.
     *
     * Change userRole to Doctor inside your
     * admin approval controller.
     */

    return res.status(201).json({
      message:
        "Doctor profile created successfully and submitted for approval.",
      success: true,

      doctor: {
        id: createdDoctor._id,
        userId: createdDoctor.userId,
        doctorName: createdDoctor.doctorName,
        doctorEmail: createdDoctor.doctorEmail,
        doctorMobile: createdDoctor.doctorMobile,
        doctorSpecialization: createdDoctor.doctorSpecialization,
        doctorStatus: createdDoctor.doctorStatus,
        doctorPhoto: createdDoctor.doctorPhoto?.url,
      },
    });
  } catch (error) {
    if (createdDoctor?._id) {
      await Doctor.deleteOne({
        _id: createdDoctor._id,
      }).catch(() => {});
    }

    await Promise.allSettled(
      uploadedAssets.map((asset) => deleteFromCloudinary(asset)),
    );

    console.error("Create Doctor Controller Error:", error);

    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0];

      return res.status(409).json({
        message: duplicateField
          ? `${duplicateField} already exists.`
          : "Doctor already exists.",
        success: false,
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: Object.values(error.errors)
          .map((validationError) => validationError.message)
          .join(", "),
        success: false,
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        message: `${error.path} contains an invalid value.`,
        success: false,
      });
    }

    return res.status(error.statusCode || 500).json({
      message: error.statusCode ? error.message : "Internal server error.",
      success: false,
    });
  }
};

/*
 * Generate a signed, non-expiring
 * Cloudinary download link.
 */

const createDocumentDownloadLink = (document) => {
  if (!document?.publicId) {
    return null;
  }

  const format = path
    .extname(document.originalName || "")
    .replace(".", "")
    .toLowerCase();

  if (!format) {
    return null;
  }

  return cloudinary.url(document.publicId, {
    secure: true,
    sign_url: true,

    resource_type: document.resourceType || "image",

    type: document.deliveryType || "authenticated",

    format,
  });
};

/*
 * Handle existing and missing documents.
 */

const createDocumentResponse = (document) => {
  if (!document) {
    return {
      available: false,
      originalName: null,
      downloadUrl: null,
    };
  }

  return {
    available: true,
    originalName: document.originalName,
    downloadUrl: createDocumentDownloadLink(document),
  };
};

// Get doctor by ID
export const doctorById = async (req, res) => {
  try {
    const { doctorId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({
        message: "Invalid doctor ID.",
        success: false,
      });
    }

    const doctor = await Doctor.findById(doctorId).select("-__v");

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found.",
        success: false,
      });
    }

    /*
     * Convert the Mongoose document into
     * a normal JavaScript object.
     */

    const doctorInformation = doctor.toObject();

    /*
     * Return DOB in YYYY-MM-DD format.
     */

    if (doctorInformation.doctorDOB) {
      doctorInformation.doctorDOB = new Date(doctorInformation.doctorDOB)
        .toISOString()
        .slice(0, 10);
    }

    /*
     * Create downloadable links before
     * removing private Cloudinary data.
     */

    const documents = {
      registrationCertificate: createDocumentResponse(
        doctorInformation.doctorRegistrationCertificate,
      ),
      qualificationCertificate: createDocumentResponse(
        doctorInformation.doctorQualificationCertificate,
      ),
      governmentId: createDocumentResponse(
        doctorInformation.doctorGovernmentId,
      ),
      supportingDocument: createDocumentResponse(
        doctorInformation.doctorSupportingDocument,
      ),
    };

    /*
     * Remove original document objects
     * so publicId and delivery information
     * are not exposed.
     */

    delete doctorInformation.doctorRegistrationCertificate;
    delete doctorInformation.doctorQualificationCertificate;
    delete doctorInformation.doctorGovernmentId;
    delete doctorInformation.doctorSupportingDocument;

    /*
     * Add safe downloadable links.
     */

    doctorInformation.documents = documents;

    return res.status(200).json({
      message: "Doctor information fetched successfully.",
      success: true,
      doctor: doctorInformation,
    });
  } catch (error) {
    console.error("Doctor By ID Controller Error:", error.message);

    return res.status(500).json({
      message: "Internal server error.",
      success: false,
    });
  }
};

// Update Doctor
export const updateDoctor = async (req, res) => {
  const uploadedAssets = [];
  const oldAssetsToDelete = [];

  try {
    const { doctorId } = req.params;

    // =========================================================
    // 1. Validate Doctor ID
    // =========================================================

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({
        message: "Invalid doctor ID.",
        success: false,
      });
    }

    // =========================================================
    // 2. Find Doctor
    // =========================================================

    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found.",
        success: false,
      });
    }

    // =========================================================
    // 3. Read Request Body
    // =========================================================

    const {
      doctorName,
      doctorEmail,
      doctorMobile,
      doctorGender,
      doctorStatus,
      doctorDOB,
      doctorCity,
      doctorState,
      doctorCountry,
      doctorSpecialization,
      doctorExperience,
      doctorMedicalNumber,
      doctorRegistrationCouncil,
      doctorQualification,
      doctorBiography,
      doctorConsultationFee,
      doctorConsultationDuration,
      doctorSlotDuration,
      doctorMaxAppointments,
      doctorScheduleEffectiveFrom,
      doctorConsultationInstruction,
    } = req.body;

    // =========================================================
    // 4. Normalize Email
    // =========================================================

    const normalizedEmail =
      doctorEmail !== undefined
        ? doctorEmail.trim().toLowerCase()
        : doctor.doctorEmail;

    // =========================================================
    // 5. Normalize Mobile
    // =========================================================

    const normalizedMobile =
      doctorMobile !== undefined
        ? normalizeIndianMobile(doctorMobile)
        : doctor.doctorMobile;

    // =========================================================
    // 6. Medical Number
    // =========================================================

    const normalizedMedicalNumber =
      doctorMedicalNumber !== undefined
        ? doctorMedicalNumber.trim()
        : doctor.doctorMedicalNumber;

    // =========================================================
    // 7. Check Duplicate Doctor
    // =========================================================

    const duplicateDoctor = await Doctor.findOne({
      _id: { $ne: doctor._id },

      $or: [
        {
          doctorEmail: normalizedEmail,
        },
        {
          doctorMobile: normalizedMobile,
        },
        {
          doctorMedicalNumber: normalizedMedicalNumber,
        },
      ],
    });

    if (duplicateDoctor) {
      return res.status(409).json({
        message:
          "Another doctor already exists with this email, mobile number or medical registration number.",
        success: false,
      });
    }

    // =========================================================
    // 8. Find Associated User
    // =========================================================

    const user = await User.findById(doctor.userId);

    if (!user) {
      return res.status(400).json({
        message: "Associated user account was not found.",
        success: false,
      });
    }

    // =========================================================
    // 9. Check User Email / Mobile Duplicate
    // =========================================================

    if (
      normalizedEmail !== user.userEmail ||
      normalizedMobile !== user.userMobile
    ) {
      const existingUser = await User.findOne({
        _id: { $ne: user._id },

        $or: [
          {
            userEmail: normalizedEmail,
          },
          {
            userMobile: normalizedMobile,
          },
          {
            userMobile: `+91${normalizedMobile}`,
          },
        ],
      });

      if (existingUser) {
        return res.status(409).json({
          message:
            "Another user already exists with this email or mobile number.",
          success: false,
        });
      }
    }

    // =========================================================
    // 10. Parse Additional Specializations
    // =========================================================

    const additionalSpecializations =
      req.body.doctorAdditionalSpecializations !== undefined
        ? ensureArray(
            parseJSONField(
              req.body.doctorAdditionalSpecializations,
              "doctorAdditionalSpecializations",
              [],
            ),
            "doctorAdditionalSpecializations",
          )
        : doctor.doctorAdditionalSpecializations || [];

    // =========================================================
    // 11. Parse Languages
    // =========================================================

    const languages =
      req.body.doctorLanguages !== undefined
        ? ensureArray(
            parseJSONField(req.body.doctorLanguages, "doctorLanguages", []),
            "doctorLanguages",
          )
        : doctor.doctorLanguages || [];

    if (languages.length === 0) {
      return res.status(400).json({
        message: "At least one doctor language is required.",
        success: false,
      });
    }

    // =========================================================
    // 12. Parse Weekly Schedule
    // =========================================================

    let weeklySchedule;

    if (req.body.doctorWeeklySchedule !== undefined) {
      const weeklyScheduleValue = parseJSONField(
        req.body.doctorWeeklySchedule,
        "doctorWeeklySchedule",
        [],
      );

      weeklySchedule = validateWeeklySchedule(
        ensureArray(weeklyScheduleValue, "doctorWeeklySchedule"),
      );
    }

    // =========================================================
    // 13. Parse Unavailable Dates
    // =========================================================

    const unavailableDates =
      req.body.doctorUnavailableDates !== undefined
        ? ensureArray(
            parseJSONField(
              req.body.doctorUnavailableDates,
              "doctorUnavailableDates",
              [],
            ),
            "doctorUnavailableDates",
          )
        : doctor.doctorUnavailableDates || [];

    // =========================================================
    // 14. Cloudinary Upload Definitions
    // =========================================================

    const uploadDefinitions = [
      {
        field: "doctorPhoto",
        folder: "doctors/photos",
        isPrivate: false,
      },
      {
        field: "doctorRegistrationCertificate",
        folder: "doctors/registration-certificates",
        isPrivate: true,
      },
      {
        field: "doctorQualificationCertificate",
        folder: "doctors/qualification-certificates",
        isPrivate: true,
      },
      {
        field: "doctorGovernmentId",
        folder: "doctors/government-ids",
        isPrivate: true,
      },
      {
        field: "doctorSupportingDocument",
        folder: "doctors/supporting-documents",
        isPrivate: true,
      },
    ];

    // =========================================================
    // 15. Upload New Files
    // =========================================================

    const uploadedFiles = {};

    for (const definition of uploadDefinitions) {
      const file = req.files?.[definition.field]?.[0];

      // No new file
      // Keep existing file
      if (!file) {
        continue;
      }

      const uploadedAsset = await uploadToCloudinary({
        file,
        folder: definition.folder,
        isPrivate: definition.isPrivate,
      });

      uploadedAssets.push(uploadedAsset);

      uploadedFiles[definition.field] = uploadedAsset;
    }

    // =========================================================
    // 16. Prepare Update Object
    // =========================================================

    const updateData = {
      doctorEmail: normalizedEmail,
      doctorMobile: normalizedMobile,
      doctorMedicalNumber: normalizedMedicalNumber,
      doctorAdditionalSpecializations: additionalSpecializations,
      doctorLanguages: languages,
      doctorUnavailableDates: unavailableDates,
    };

    // =========================================================
    // 17. Update Optional Fields
    // =========================================================

    if (doctorName !== undefined) {
      updateData.doctorName = doctorName.trim();
    }

    if (doctorStatus !== undefined) {
      updateData.doctorStatus = doctorStatus;
    }

    if (doctorGender !== undefined) {
      updateData.doctorGender = doctorGender;
    }

    if (doctorDOB !== undefined) {
      updateData.doctorDOB = doctorDOB;
    }

    if (doctorCity !== undefined) {
      updateData.doctorCity = doctorCity.trim();
    }

    if (doctorState !== undefined) {
      updateData.doctorState = doctorState.trim();
    }

    if (doctorCountry !== undefined) {
      updateData.doctorCountry = doctorCountry.trim();
    }

    if (doctorSpecialization !== undefined) {
      updateData.doctorSpecialization = doctorSpecialization.trim();
    }

    if (doctorExperience !== undefined) {
      updateData.doctorExperience = numberValue(
        doctorExperience,
        "doctorExperience",
      );
    }

    if (doctorRegistrationCouncil !== undefined) {
      updateData.doctorRegistrationCouncil = doctorRegistrationCouncil.trim();
    }

    if (doctorQualification !== undefined) {
      updateData.doctorQualification = doctorQualification.trim();
    }

    if (doctorBiography !== undefined) {
      updateData.doctorBiography = doctorBiography.trim();
    }

    if (doctorConsultationFee !== undefined) {
      updateData.doctorConsultationFee = numberValue(
        doctorConsultationFee,
        "doctorConsultationFee",
      );
    }

    if (doctorConsultationDuration !== undefined) {
      updateData.doctorConsultationDuration = numberValue(
        doctorConsultationDuration,
        "doctorConsultationDuration",
      );
    }

    if (doctorSlotDuration !== undefined) {
      updateData.doctorSlotDuration = numberValue(
        doctorSlotDuration,
        "doctorSlotDuration",
      );
    }

    if (doctorMaxAppointments !== undefined) {
      updateData.doctorMaxAppointments = numberValue(
        doctorMaxAppointments,
        "doctorMaxAppointments",
      );
    }

    if (doctorScheduleEffectiveFrom !== undefined) {
      updateData.doctorScheduleEffectiveFrom =
        doctorScheduleEffectiveFrom || undefined;
    }

    if (doctorConsultationInstruction !== undefined) {
      updateData.doctorConsultationInstruction =
        doctorConsultationInstruction.trim();
    }

    if (weeklySchedule !== undefined) {
      updateData.doctorWeeklySchedule = weeklySchedule;
    }

    // =========================================================
    // 18. Replace Files
    // =========================================================

    for (const definition of uploadDefinitions) {
      const newFile = uploadedFiles[definition.field];

      // No new file
      if (!newFile) {
        continue;
      }

      const oldFile = doctor[definition.field];

      // Remember old Cloudinary file
      // It will be deleted only AFTER DB update succeeds.
      if (oldFile?.publicId) {
        oldAssetsToDelete.push(oldFile);
      }

      updateData[definition.field] = newFile;
    }

    // =========================================================
    // 19. Update Doctor Document
    // =========================================================

    Object.assign(doctor, updateData);

    await doctor.save();

    // =========================================================
    // 20. Update User Account
    // =========================================================

    user.userEmail = normalizedEmail;
    user.userMobile = normalizedMobile;

    await user.save();

    // =========================================================
    // 21. Delete OLD Cloudinary Files
    // =========================================================

    if (oldAssetsToDelete.length > 0) {
      await Promise.allSettled(
        oldAssetsToDelete.map((asset) => deleteFromCloudinary(asset)),
      );
    }

    // =========================================================
    // 22. Success Response
    // =========================================================

    return res.status(200).json({
      message: "Doctor profile updated successfully.",
      success: true,

      doctor: {
        id: doctor._id,
        userId: doctor.userId,
        doctorName: doctor.doctorName,
        doctorEmail: doctor.doctorEmail,
        doctorMobile: doctor.doctorMobile,
        doctorSpecialization: doctor.doctorSpecialization,
        doctorStatus: doctor.doctorStatus,
        doctorPhoto: doctor.doctorPhoto?.url,
      },
    });
  } catch (error) {
    // =========================================================
    // 23. Delete NEW Uploads If Update Failed
    // =========================================================

    await Promise.allSettled(
      uploadedAssets.map((asset) => deleteFromCloudinary(asset)),
    );

    console.error("Update Doctor Controller Error:", error);

    // =========================================================
    // Duplicate Error
    // =========================================================

    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0];

      return res.status(409).json({
        message: duplicateField
          ? `${duplicateField} already exists.`
          : "Doctor already exists.",
        success: false,
      });
    }

    // =========================================================
    // Mongoose Validation Error
    // =========================================================

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: Object.values(error.errors)
          .map((validationError) => validationError.message)
          .join(", "),
        success: false,
      });
    }

    // =========================================================
    // Mongoose Cast Error
    // =========================================================

    if (error.name === "CastError") {
      return res.status(400).json({
        message: `${error.path} contains an invalid value.`,
        success: false,
      });
    }

    // =========================================================
    // Other Errors
    // =========================================================

    return res.status(error.statusCode || 500).json({
      message: error.statusCode ? error.message : "Internal server error.",
      success: false,
    });
  }
};

// View All Docotors
// Get All Doctors - Basic Information
export const getAllDoctors = async (_, res) => {
  try {
    const doctors = await Doctor.find()
      .select(
        "_id doctorName doctorPhoto doctorEmail doctorMobile " +
          "doctorSpecialization doctorExperience doctorCity " +
          "doctorConsultationFee doctorStatus",
      )
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      message: "Doctors fetched successfully.",
      success: true,
      totalDoctors: doctors.length,
      doctors,
    });
  } catch (error) {
    console.error("Get All Doctors Controller Error:", error);

    return res.status(500).json({
      message: "Internal server error.",
      success: false,
    });
  }
};

// View Profile Doctor By user
export const viewProfile = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({
        message: "Invalid doctor ID.",
        success: false,
      });
    }

    const doctor = await Doctor.findById(doctorId).select(
      "_id doctorName doctorPhoto doctorExperience doctorLanguages doctorQualification doctorAdditionalSpecializations doctorConsultationFee doctorBiography",
    );

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not exist any more",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Doctor Profile",
      success: true,
      doctor
    });

  } catch (error) {
    console.error("View Profile Controller: Error", error);

    return res.status(500).json({
      message: "Intrnal Server Error",
      success: false,
    });
  }
};

// Appointment Doctor Details
