import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import connectDB from "../db/index.js";
import { healthCheckCloudinary } from "../utils/cloudinary.js";

const healthcheck = asyncHandler(async (req, res) => {
    try {
        // Checking the database connection
        const dbStatus = await connectDB()
        if (!dbStatus) {
            throw new ApiError(500, "Database connection failed");
        }

        // Checking the cloudinary dependencies
        const cloudinaryStatus = await healthCheckCloudinary();
        if (!cloudinaryStatus) {
            throw new ApiError(500, "Cloudinary service is down");
        }

        // health check response object
        const healthStatus = {
            database: "connected",
            cloudinary: "connected"
        };

        return res
            .status(200)
            .json(
                new ApiResponse(200, healthStatus, "Everything is working fine")
            );
    } catch (error) {
        console.error('Health check error:', error);
        return res
        .status(500)
        .json(
            new ApiResponse(500, {}, "Health check failed", error.message)
        );
    }
});

export {
    healthcheck
};
