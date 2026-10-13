import cloudinary from "../config/cloudinary.js";

export const uploadToCloudinary = ({
  file,
  folder,
  isPrivate = false,
}) => {
  return new Promise((resolve, reject) => {
    const uploadStream =
      cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "auto",

          type: isPrivate
            ? "authenticated"
            : "upload",

          use_filename: false,
          unique_filename: true,
          overwrite: false,
        },

        (error, result) => {
          if (error) {
            return reject(error);
          }

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            resourceType: result.resource_type,
            deliveryType: result.type,
            originalName: file.originalname,
          });
        }
      );

    uploadStream.end(file.buffer);
  });
};

export const deleteFromCloudinary = async (asset) => {
    if (!asset?.publicId) {
      return;
    }

    await cloudinary.uploader.destroy(
      asset.publicId,
      {
        resource_type:
          asset.resourceType || "image",

        type:
          asset.deliveryType || "upload",

        invalidate: true,
      }
    );
  };