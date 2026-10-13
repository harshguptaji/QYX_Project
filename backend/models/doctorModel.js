import mongoose from "mongoose";

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const cloudinaryFileSchema =
  new mongoose.Schema(
    {
      url: {
        type: String,
        required: true,
      },

      publicId: {
        type: String,
        required: true,
      },

      resourceType: {
        type: String,
        required: true,
      },

      deliveryType: {
        type: String,
        required: true,
      },

      originalName: {
        type: String,
        required: true,
      },
    },
    {
      _id: false,
    }
  );

const breakTimeSchema =
  new mongoose.Schema(
    {
      breakStart: {
        type: String,
        required: true,
        match: [
          TIME_PATTERN,
          "Break start must use HH:mm format.",
        ],
      },

      breakEnd: {
        type: String,
        required: true,
        match: [
          TIME_PATTERN,
          "Break end must use HH:mm format.",
        ],
      },
    },
    {
      _id: true,
    }
  );

const weeklyScheduleSchema =
  new mongoose.Schema(
    {
      day: {
        type: String,
        enum: DAYS,
        required: true,
      },

      isEnabled: {
        type: Boolean,
        default: false,
      },

      scheduleStart: {
        type: String,
        default: null,
        match: [
          TIME_PATTERN,
          "Schedule start must use HH:mm format.",
        ],

        required: function () {
          return this.isEnabled;
        },
      },

      scheduleEnd: {
        type: String,
        default: null,
        match: [
          TIME_PATTERN,
          "Schedule end must use HH:mm format.",
        ],

        required: function () {
          return this.isEnabled;
        },
      },

      breakTimes: {
        type: [breakTimeSchema],
        default: [],
      },
    },
    {
      _id: false,
    }
  );

const unavailableDateSchema =
  new mongoose.Schema(
    {
      date: {
        type: String,
        required: true,

        validate: {
          validator: function (value) {
            if (!DATE_PATTERN.test(value)) {
              return false;
            }

            const parsedDate = new Date(
              `${value}T00:00:00.000Z`
            );

            return (
              !Number.isNaN(parsedDate.getTime()) &&
              parsedDate
                .toISOString()
                .slice(0, 10) === value
            );
          },

          message:
            "Unavailable date must be a valid YYYY-MM-DD date.",
        },
      },
    },
    {
      _id: true,
    }
  );

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    doctorName: {
      type: String,
      required: [true, "Doctor name is required."],
      trim: true,
    },

    doctorPhoto: {
      type: cloudinaryFileSchema,
      required: true,
    },

    doctorEmail: {
      type: String,
      required: [true, "Doctor email is required."],
      unique: true,
      lowercase: true,
      trim: true,

      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address.",
      ],
    },

    doctorMobile: {
      type: String,
      required: [
        true,
        "Doctor mobile number is required.",
      ],
      unique: true,
      trim: true,

      match: [
        /^[6-9]\d{9}$/,
        "Please enter a valid 10-digit Indian mobile number.",
      ],
    },

    doctorGender: {
      type: String,
      enum: ["Female", "Male", "Other"],
      required: true,
    },

    doctorDOB: {
      type: Date,
      required: [
        true,
        "Doctor date of birth is required.",
      ],

      validate: {
        validator: function (value) {
          return value <= new Date();
        },

        message:
          "Date of birth cannot be a future date.",
      },
    },

    doctorCity: {
      type: String,
      required: true,
      trim: true,
    },

    doctorState: {
      type: String,
      required: true,
      trim: true,
    },

    doctorCountry: {
      type: String,
      required: true,
      trim: true,
    },

    doctorSpecialization: {
      type: String,
      required: true,
      trim: true,
    },

    doctorExperience: {
      type: Number,
      required: true,
      min: [
        0,
        "Experience cannot be negative.",
      ],
    },

    doctorMedicalNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    doctorRegistrationCouncil: {
      type: String,
      required: true,
      trim: true,
    },

    doctorQualification: {
      type: String,
      required: true,
      trim: true,
    },

    doctorAdditionalSpecializations: {
      type: [String],
      default: [],
    },

    doctorLanguages: {
      type: [String],
      required: true,

      validate: {
        validator: function (languages) {
          return (
            Array.isArray(languages) &&
            languages.length > 0
          );
        },

        message:
          "At least one language is required.",
      },
    },

    doctorBiography: {
      type: String,
      required: true,
      trim: true,
      maxlength: [
        1000,
        "Biography cannot exceed 3000 characters.",
      ],
    },

    doctorConsultationFee: {
      type: Number,
      required: true,
      min: [
        0,
        "Consultation fee cannot be negative.",
      ],
    },

    doctorConsultationDuration: {
      type: Number,
      required: true,
      min: [
        5,
        "Consultation duration must be at least 5 minutes.",
      ],
    },

    doctorSlotDuration: {
      type: Number,
      required: true,
      enum: {
        values: [15, 20, 30, 45, 60],
        message:
          "Slot duration must be 15, 20, 30, 45 or 60 minutes.",
      },
    },

    doctorMaxAppointments: {
      type: Number,
      required: true,
      min: [
        1,
        "Maximum appointments must be at least 1.",
      ],
    },

    doctorScheduleEffectiveFrom: {
      type: Date,
      required: true,
      default: Date.now,
    },

    doctorWeeklySchedule: {
      type: [weeklyScheduleSchema],

      default: () =>
        DAYS.map((day) => ({
          day,
          isEnabled: false,
          scheduleStart: null,
          scheduleEnd: null,
          breakTimes: [],
        })),

      validate: {
        validator: function (schedules) {
          if (
            !Array.isArray(schedules) ||
            schedules.length !== 7
          ) {
            return false;
          }

          const uniqueDays = new Set(
            schedules.map(
              (schedule) => schedule.day
            )
          );

          return uniqueDays.size === 7;
        },

        message:
          "Weekly schedule must contain all seven unique days.",
      },
    },

    doctorUnavailableDates: {
      type: [unavailableDateSchema],
      default: [],
    },

    doctorConsultationInstruction: {
      type: String,
      required: true,
      trim: true,
      maxlength: [
        2000,
        "Consultation instruction cannot exceed 2000 characters.",
      ],
    },

    doctorRegistrationCertificate: {
      type: cloudinaryFileSchema,
      required: true,
    },

    doctorQualificationCertificate: {
      type: cloudinaryFileSchema,
      required: true,
    },

    doctorGovernmentId: {
      type: cloudinaryFileSchema,
      required: true,
    },

    doctorSupportingDocument: {
      type: cloudinaryFileSchema,
      default: null,
    },

    doctorStatus: {
      type: String,

      enum: [
        "Pending",
        "Approved",
        "Rejected",
        "Suspended",
      ],

      default: "Approved",
    },
  },
  {
    timestamps: true,
  }
);

const Doctor = mongoose.model(
  "Doctor",
  doctorSchema
);

export default Doctor;