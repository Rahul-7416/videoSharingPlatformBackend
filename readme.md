# Video Streaming Platform Backend

This repository contains the backend code for a video streaming platform built with Node.js, Express, and MongoDB. The platform allows users to upload, manage, and view videos, as well as manage playlists, subscriptions, and likes.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Health Check](#health-check)
- [Contributing](#contributing)
- [License](#license)

## Features

- User authentication and authorization
- Video upload and management
- Playlist creation and management
- Video view tracking
- Like and subscription management
- Pagination for video and comment listings
- Health check endpoints for system monitoring

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/Rahul-7416/videoStreamingPlatformBackend.git
    ```

2. Navigate to the project directory:

    ```bash
    cd videoStreamingPlatformBackend
    ```

3. Install the dependencies:

    ```bash
    npm install
    ```

4. Set up environment variables:

    Create a `.env` file in the root directory and add the following environment variables:

    ```plaintext
    CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
    CLOUDINARY_API_KEY=<your-cloudinary-api-key>
    CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
    MONGODB_URI=<your-mongodb-uri>
    JWT_SECRETS=<your-jwt-secret>
    ```

5. Start the server:

    ```bash
    npm run dev
    ```

## Usage

The backend server will be running on `http://localhost:3000`. You can use tools like Postman or cURL to interact with the API endpoints.

## API Endpoints

### Authentication

- **POST /auth/signup**: Register a new user
- **POST /auth/login**: Log in a user

### Videos

- **POST /videos**: Upload a new video
- **GET /videos/:id**: Get video details
- **PATCH /videos/:id**: Update video details
- **DELETE /videos/:id**: Delete a video
- **POST /videos/:id/views**: Increment video view count

### Playlists

- **POST /playlists**: Create a new playlist
- **GET /playlists/:id**: Get playlist details
- **PATCH /playlists/:id**: Update playlist details
- **DELETE /playlists/:id**: Delete a playlist
- **POST /playlists/:id/videos/:videoId**: Add a video to a playlist
- **DELETE /playlists/:id/videos/:videoId**: Remove a video from a playlist

### Subscriptions

- **POST /subscriptions/:channelId**: Subscribe to a channel
- **DELETE /subscriptions/:channelId**: Unsubscribe from a channel

### Likes

- **POST /videos/:id/like**: Like a video
- **DELETE /videos/:id/like**: Unlike a video

## Health Check

### General Health Check

- **GET /healthcheck**: Check the health status of the application

    ```javascript
    import {ApiError} from "../utils/ApiError.js"
    import {ApiResponse} from "../utils/ApiResponse.js"
    import {asyncHandler} from "../utils/asyncHandler.js"

    const healthcheck = asyncHandler(async (req, res) => {
        // build a healthcheck response that simply returns the OK status as json with a message

        return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Everything is working fine")
        );
    });

    export {
        healthcheck
    }
    ```

### Cloudinary Health Check

- Check the connectivity and functionality of Cloudinary APIs

    ```javascript
    import { ApiError } from "../utils/ApiError.js";
    import { ApiResponse } from "../utils/ApiResponse.js";
    import { asyncHandler } from "../utils/asyncHandler.js";
    import { connectDB } from '../db/index.js'; 
    import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

    const healthcheck = asyncHandler(async (req, res) => {
        try {
            // Check the database connection
            const dbStatus = await connectDB.checkConnection();
            if (!dbStatus) {
                throw new ApiError(500, "Database connection failed");
            }

            // Check other dependencies if needed
            // For example, checking a third-party API service, cache service, etc.
            // const apiServiceStatus = await checkAPIService();
            // if (!apiServiceStatus) {
            //     throw new ApiError(500, "API service is down");
            // }

            // Build the health check response
            const healthStatus = {
                database: "connected",
                // apiService: "connected" // Add other services as needed
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
    ```

## Contributing

Contributions are welcome! Please fork this repository and submit a pull request for any improvements or bug fixes.


