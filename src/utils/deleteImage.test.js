const cloudinary = require("../config/cloudinary").cloudinary;
const { deleteImgCloudinary } = require("./deleteImage");

// Simulate cloudinary uploader destroy method
jest.mock("../config/cloudinary", () => ({
	cloudinary: {
		uploader: {
			destroy: jest.fn().mockResolvedValue("ok"),
		},
	},
}));

describe("deleteImgCloudinary", () => {
	afterEach(() => jest.clearAllMocks());

	// When no publicId is provided, the function should return undefined and not call destroy
	it("should return undefined if no publicId is provided", async () => {
		const result = await deleteImgCloudinary();
		expect(result).toBeUndefined();
		expect(cloudinary.uploader.destroy).not.toHaveBeenCalled();
	});

	// When a valid publicId is provided, it should call cloudinary.uploader.destroy with that ID
	it("should call cloudinary.uploader.destroy with publicId", async () => {
		cloudinary.uploader.destroy.mockResolvedValue("ok");
		const result = await deleteImgCloudinary("someId");
		expect(cloudinary.uploader.destroy).toHaveBeenCalledWith("someId");
		expect(result).toBe("ok");
	});

	// If cloudinary.uploader.destroy fails, the function should throw an error
	it("should throw error if cloudinary.uploader.destroy fails", async () => {
		cloudinary.uploader.destroy.mockRejectedValue(new Error("fail"));
		await expect(deleteImgCloudinary("badId")).rejects.toThrow(
			"Failed to delete image from Cloudinary",
		);
	});
});
