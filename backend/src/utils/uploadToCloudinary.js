import cloudinary from "../config/cloudinary.js";

const uploadToCloudinary = async (files) => {
  const uploadPromises = files.map((file) =>
    cloudinary.uploader.upload(file.path, {
      folder: "college_marketplace/listings",
    })
  );

  const results = await Promise.all(uploadPromises);
  return results.map((r) => r.secure_url);
};

export default uploadToCloudinary;
