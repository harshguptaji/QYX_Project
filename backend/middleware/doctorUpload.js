import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

const PHOTO_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/x-png",
  "image/webp",
]);

const DOCUMENT_MIME_TYPES =
  new Set([
    ...PHOTO_MIME_TYPES,
    "application/pdf",
  ]);

const PHOTO_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
]);

const DOCUMENT_EXTENSIONS =
  new Set([
    ...PHOTO_EXTENSIONS,
    ".pdf",
  ]);

const fileFilter = (
  req,
  file,
  callback
) => {
  const extension = path
    .extname(file.originalname)
    .toLowerCase();

  const isGenericMimeType =
    file.mimetype ===
    "application/octet-stream";

  console.log("Uploaded file:", {
    fieldName: file.fieldname,
    originalName: file.originalname,
    mimeType: file.mimetype,
    extension,
  });

  /*
   * Validate doctor photo.
   *
   * Some clients send valid PNG/JPG files
   * as application/octet-stream, so the
   * extension is used as a fallback.
   */
  if (
    file.fieldname === "doctorPhoto"
  ) {
    const validMimeType =
      PHOTO_MIME_TYPES.has(
        file.mimetype
      );

    const validGenericFile =
      isGenericMimeType &&
      PHOTO_EXTENSIONS.has(extension);

    if (
      !validMimeType &&
      !validGenericFile
    ) {
      const error = new Error(
        "Doctor photo must be JPG, JPEG, PNG or WEBP."
      );

      error.statusCode = 400;

      return callback(error, false);
    }

    return callback(null, true);
  }

  /*
   * Validate certificate and document
   * fields.
   */
  const validMimeType =
    DOCUMENT_MIME_TYPES.has(
      file.mimetype
    );

  const validGenericFile =
    isGenericMimeType &&
    DOCUMENT_EXTENSIONS.has(extension);

  if (
    !validMimeType &&
    !validGenericFile
  ) {
    const error = new Error(
      `${file.fieldname} must be JPG, JPEG, PNG, WEBP or PDF.`
    );

    error.statusCode = 400;

    return callback(error, false);
  }

  return callback(null, true);
};

const upload = multer({
  storage,
  fileFilter,

  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 5,
  },
});

export const uploadDoctorFiles =
  upload.fields([
    {
      name: "doctorPhoto",
      maxCount: 1,
    },
    {
      name:
        "doctorRegistrationCertificate",
      maxCount: 1,
    },
    {
      name:
        "doctorQualificationCertificate",
      maxCount: 1,
    },
    {
      name: "doctorGovernmentId",
      maxCount: 1,
    },
    {
      name:
        "doctorSupportingDocument",
      maxCount: 1,
    },
  ]);