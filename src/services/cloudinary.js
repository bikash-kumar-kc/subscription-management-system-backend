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

export default uploadFile;
