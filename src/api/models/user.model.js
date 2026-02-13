const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true },
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
			match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
		},
		password: {
			type: String,
			required: true,
			trim: true,
			minlength: [8, "Password 8 characters minimum"],
			select: false, // Excluye password por defecto en queries
		},
		role: { type: String, enum: ["user", "admin"], default: "user" },
		profileImageUrl: { type: String, trim: true },
		profileImageId: { type: String, trim: true },
	},
	{
		timestamps: true,
		versionKey: false,
	},
);

userSchema.pre("save", async function (next) {
	// The password is hashed if the user modifies it or if it is new
	if (!this.isModified("password")) return next();

	try {
		const salt = await bcrypt.genSalt(10);
		this.password = await bcrypt.hash(this.password, salt);
		next();
	} catch (error) {
		next(error);
	}
});

userSchema.index({ email: 1 });

const User = mongoose.model("User", userSchema);

module.exports = User;
