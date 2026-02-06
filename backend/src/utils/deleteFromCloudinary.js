import cloudinary from "../config/cloudinary.js";

const deleteFromCloudinary = async (imageUrl) => {
  if (!imageUrl) return;

  // Example URL:
  // https://res.cloudinary.com/<cloud>/image/upload/v123/folder/name.jpg

  const parts = imageUrl.split("/");
  const fileWithExt = parts[parts.length - 1];
  const publicId = fileWithExt.split(".")[0];

  // folder path (if any)
  const folderIndex = parts.findIndex((p) => p === "upload");
  const folderPath = parts.slice(folderIndex + 1, parts.length - 1).join("/");

  const fullPublicId = folderPath
    ? `${folderPath}/${publicId}`
    : publicId;

  await cloudinary.uploader.destroy(fullPublicId);
};

export default deleteFromCloudinary;
