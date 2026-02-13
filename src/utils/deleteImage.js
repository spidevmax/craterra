const { cloudinary } = require("../config/cloudinary");
const { createError } = require("./createError");

const deleteImgCloudinary = async (publicId) => {
	if (!publicId) {
		return;
	}
	try {
		await cloudinary.uploader.destroy(publicId);
	} catch (_error) {
		throw createError(500, "Failed to delete image from Cloudinary");
		//console.error("No se pudo eliminar la imagen");
	}
};

module.exports = { deleteImgCloudinary };
