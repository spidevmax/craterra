const { cloudinary } = require("../config/cloudinary");

const deleteImgCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.warn("[Cloudinary] No se pudo eliminar:", publicId, error.message);
  }
};

module.exports = { deleteImgCloudinary };
