import cloudinary from "../cloudinary/cloudinary.js";

const uploadFile = async ({
  file,
  fileName,
  folderName,
  fileFormat,
  resourceType = "image",
}) => {
  const uploadResult = await cloudinary.uploader.upload(file, {
    filename_override: fileName,
    folder: folderName,
    format: fileFormat,
    resource_type: resourceType,
  });

  return uploadResult;
};

export const deleteFile = async (publicKey) => {
  const isImageDeleted = await cloudinary.uploader.destroy(
    `sms_users_profile_image/${publicKey}`,
  );
  return isImageDeleted;
};

export default uploadFile;
