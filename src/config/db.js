const mongoose = require("mongoose");

const connectDB = async () => {
	try {
		await mongoose.connect(process.env.DB_URL);
		console.log("MongoDB connected successfully");
	} catch (error) {
		console.log("Error connecting database: ", error.message);
	}
};

module.exports = { connectDB };
