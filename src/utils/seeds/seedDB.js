require("dotenv").config();
const mongoose = require("mongoose");

const User = require("../../api/models/user.model");
const Album = require("../../api/models/album.model");

const usersData = require("../../data/users");
const albumsData = require("../../data/albums");

const { connectCloudinary } = require("../../config/cloudinary");

const { deleteImgCloudinary } = require("../../utils/deleteImage");

const seedDB = async () => {
	try {
		// -----------------------------------------
		// Connect to MongoDB
		// -----------------------------------------
		await mongoose.connect(process.env.DB_URL);
		console.log("✅ MongoDB connected");

connectCloudinary();

		// -----------------------------------------
		// Get existing documents
		// -----------------------------------------
		const [usersInDB, albumsInDB] = await Promise.all([
			User.find(),
			Album.find(),
		]);

		// -----------------------------------------
		// Delete Cloudinary images
		// -----------------------------------------
		await Promise.all([
			...usersInDB
				.filter((user) => user.profileImageId)
				.map((user) => deleteImgCloudinary(user.profileImageId)),

			...albumsInDB
				.filter((album) => album.coverArtId)
				.map((album) => deleteImgCloudinary(album.coverArtId)),
		]);

		console.log("☁️ Cloudinary cleaned");

		// -----------------------------------------
		// Clear collections
		// -----------------------------------------
		await Promise.all([
			User.deleteMany({}),
			Album.deleteMany({}),
		]);

		console.log("🗑️ Database cleaned");

		// -----------------------------------------
		// Insert users
		// Using save() so pre('save') middleware runs
		// -----------------------------------------
		const insertedUsers = [];

		for (const userData of usersData) {
			const user = new User(userData);
			await user.save();

			insertedUsers.push(user);
		}

		console.log(`✅ ${insertedUsers.length} users inserted`);

		console.table(
			insertedUsers.map((user) => ({
				id: user._id.toString(),
				name: user.name,
				email: user.email,
				role: user.role,
			}))
		);

		// -----------------------------------------
		// Assign albums to normal users
		// -----------------------------------------
		const normalUsers = insertedUsers.filter(
			(user) => user.role === "user"
		);

		if (!normalUsers.length) {
			throw new Error("No users available to assign albums.");
		}

		const insertedAlbums = [];

		for (let i = 0; i < albumsData.length; i++) {
			const album = new Album({
				...albumsData[i],
				addedBy: normalUsers[i % normalUsers.length]._id,
			});

			// Executes pre('save') middleware (wordCount, future hooks, etc.)
			await album.save();

			insertedAlbums.push(album);
		}

		console.log(`✅ ${insertedAlbums.length} albums inserted`);

		console.table(
			insertedAlbums.map((album) => ({
				id: album._id.toString(),
				title: album.title,
				addedBy: insertedUsers.find((u) =>
					u._id.equals(album.addedBy)
				)?.email,
			}))
		);

		// -----------------------------------------
		// Album connections
		// (Add here if needed in the future)
		// -----------------------------------------

		console.log("");
		console.log("🌱 Seed completed successfully");
		console.log("--------------------------------");
		console.log(`👤 Users : ${insertedUsers.length}`);
		console.log(`💿 Albums: ${insertedAlbums.length}`);
		console.log("--------------------------------");
	} catch (error) {
		console.error("❌ Error during seeding");
		console.error(error);
	} finally {
		await mongoose.disconnect();
		console.log("🔌 MongoDB disconnected");
	}
};

seedDB();
