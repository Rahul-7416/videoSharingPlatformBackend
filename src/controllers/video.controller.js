import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {deleteFromCloudinary, uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    
    // get all videos based on query, sort, pagination
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // creating the aggregation pipeline 
    const pipeline = [];

    // match stage for filtering based on the query parameter
    if (query) {
        pipeline.push({
            $match: {
                $or: [
                    {
                        title: { $regex: query, $options: 'i'}
                    },
                    {
                        description: { $regex: query, $options: 'i'}
                    }
                ]
            }
        });
    }

    // match stage for filtering based on the userId parameter
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Not a valid Objectid");
    }

    if (userId) {
        pipeline.push({
            $match: {
                owner: mongoose.Types.ObjectId.createFromHexString(userId)
            }
        });
    }

    // match stage for filtering based on the sorting parameter
    const sortOptions = {};
    sortOptions[sortBy] = sortType === 'asc' ? 1 : -1;

    pipeline.push({
        $sort: sortOptions
    });

    // Pagination 
    const options = {
        page: pageNum,
        limit: limitNum
    };

    // Execute the aggregation with pagination
    const response = await Video.aggregatePaginate(Video.aggregate(pipeline), options);

    if (!response) {
        throw new ApiError(500, "Something went wrong internally while creating aggregation cursor or pagination in getAllVideos func");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            response,
            "All videos based on the given criteria, fetched successfully"
        )
    );
});

const publishAVideo = asyncHandler(async (req, res) => {
    
    // get video, upload to cloudinary, create video
    const { title, description} = req.body

    if (
        [title, description].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(404, "Title and description are required");
    }

    const videoFileLocalPath = req.files?.videoFile[0].path;
    if (!videoFileLocalPath) {
        throw new ApiError(400, "Video File is required");
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    if (!videoFile) {
        throw new ApiError(400, "Video File is required");
    }

    const thumbnailLocalPath = req.files?.thumbnail[0].path;
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is required");
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if (!thumbnail) {
        throw new ApiError(400, "Thumbnail is required");
    }

    const video = await Video.create({
        videoFile: videoFile.url,
        videoFilePublicId: videoFile.public_id,
        thumbnail: thumbnail.url,
        thumbnailPublicId: thumbnail.public_id,
        title,
        description,
        duration: (videoFile.duration)/60,
        owner: req.user?._id
    });

    const createdVideo = await Video.findById(video._id).select("-videoFilePublicId -thumbnailPublicId");

    if (!createdVideo) {
        throw new ApiError(500, "Something went wrong while uploading the video");
    }

    return res
    .status(201)
    .json(
        new ApiResponse(200, video, "Video uploaded successfully")
    );
});

const getVideoById = asyncHandler(async (req, res) => {
    
    // get video by id
    const { videoId } = req.params;

    if (!videoId || videoId?.trim() === "") {
        throw new ApiError(400, "videoId is required");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "No video found with the given videiId");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            video,
            "Video with the given videoId fetched successfully"
        )
    );
});

const updateVideo = asyncHandler(async (req, res) => {

    // update video details like title, description, thumbnail
    const { videoId } = req.params
    
    const { title, description } = req.body;

    if (
        [title, description ].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const thumbnailLocalPath = req.file?.path;
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is required");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "No video found with the given videoId");
    }

    await deleteFromCloudinary(video.thumbnailPublicId);

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                thumbnail: thumbnail.url,
                thumbnailPublicId: thumbnail.public_id,
            }
        },
        {
            new: true
        }
    ).select("-videoFilePublicId -thumbnailPublicId");

    return res
    .status(200)
    .json(
        new ApiResponse(200, video, "Video updated successfully")
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
    if (!videoId) {
        throw new ApiError(400, "videoId is required");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "No video found with the given videoId");
    }

    // to delete the videoFile and thumbnail from the cloudinary
    await deleteFromCloudinary(video.videoFilePublicId);
    await deleteFromCloudinary(video.thumbnailPublicId);

    // to delete the document/object from the mongoDB
    await Video.findByIdAndDelete(videoId);

    return res
    .status(200)
    .json(200, {}, "Video deleted successfully");
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(400, "videoId is required");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "No video found with the given videoId");
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished: !video.isPublished
            }
        },
        {
            new: true
        }
    );

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            updatedVideo,
            "publish status toggled successfully"
        )
    );
});

const incrementVideoViews = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    video.views += 1;
    await video.save();

    return res
    .status(200)
    .json(
        new ApiResponse(200, video, "Video views incremented successfully")
    );
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    incrementVideoViews
}