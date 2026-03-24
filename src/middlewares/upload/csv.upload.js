const multer = require("multer");

const csvFilter = (req, file, cb) => {
	if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
		cb(null, true);
	} else {
		cb(new Error("Only CSV files are allowed"), false);
	}
};

const uploadCSV = multer({
	storage: multer.memoryStorage(),
	fileFilter: csvFilter,
	limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = { uploadCSV };
