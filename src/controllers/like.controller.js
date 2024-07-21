import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params;
    // toggle like on video

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }

    const existingLike = await Like.aggregate(
        [
            {
                $match: {
                    $and: [
                        { 
                            video: mongoose.Types.ObjectId.createFromHexString(videoId) 
                        },
                        {
                            likedBy: req.user?._id
                        }
                    ]
                }
            }
        ]
    );

    if (existingLike.length === 0) {
        const like = await Like.create(
            {
                video: mongoose.Types.ObjectId.createFromHexString(videoId),
                comment: null,
                tweet: null,
                likedBy: req.user?._id
            }
        );

        const createdLike = await Like.findById(like._id);

        if (!createdLike) {
            throw new ApiError(500, "Something went wrong while creating like document for the video liked")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200, createdLike, "like document for the video liked created successfully")
        )
    } else {
        await Like.findByIdAndDelete(existingLike[0]._id);

        return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Like removed from the video || like document for the video liked deleted successfully")
        );
    }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params;
    // toggle like on comment

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid commentId");
    }

    const existingLike = await Like.aggregate(
        [
            {
                $match: {
                    $and: [
                        { 
                            comment: mongoose.Types.ObjectId.createFromHexString(commentId) 
                        },
                        {
                            likedBy: req.user?._id
                        }
                    ]
                }
            }
        ]
    );

    if (existingLike.length === 0) {
        const like = await Like.create(
            {
                video: null,
                comment: mongoose.Types.ObjectId.createFromHexString(commentId),
                tweet: null,
                likedBy: req.user?._id
            }
        );

        const createdLike = await Like.findById(like._id);

        if (!createdLike) {
            throw new ApiError(500, "Something went wrong while creating like document for the comment liked")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200, createdLike, "like document for the comment liked created successfully")
        )
    } else {
        await Like.findByIdAndDelete(existingLike[0]._id);

        return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Like removed from the comment || like document for the comment liked deleted successfully")
        );
    }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params;
    // toggle like on video

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweetId");
    }

    const existingLike = await Like.aggregate(
        [
            {
                $match: {
                    $and: [
                        { 
                            tweet: mongoose.Types.ObjectId.createFromHexString(tweetId) 
                        },
                        {
                            likedBy: req.user?._id
                        }
                    ]
                }
            }
        ]
    );

    if (existingLike.length === 0) {
        const like = await Like.create(
            {
                video: null,
                comment: null,
                tweet: mongoose.Types.ObjectId.createFromHexString(tweetId),
                likedBy: req.user?._id
            }
        );

        const createdLike = await Like.findById(like._id);

        if (!createdLike) {
            throw new ApiError(500, "Something went wrong while creating like document for the tweet liked")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200, createdLike, "like document for the tweet liked created successfully")
        )
    } else {
        await Like.findByIdAndDelete(existingLike[0]._id);

        return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Like removed from the tweet || like document for the tweet liked deleted successfully")
        );
    }
});


const getLikedVideos = asyncHandler(async (req, res) => {
    // get all liked videos

    const allLikedVideos = await Like.aggregate(
        [
            {
                $match: {
                    $and: [
                        {
                            likedBy: req.user?._id
                        },
                        {
                            comment: {
                                $eq: null
                            }
                        },
                        {
                            tweet: {
                                $eq: null
                            }
                        }
                    ]
                }
            },
            {
                $project: {
                    _id: 1,
                    video: 1,
                    likedBy: 1,
                    createdAt: 1,
                    updatedAt: 1
                }
            }
        ]
    );

    return res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            {
                totalLikedVideos: allLikedVideos.length,
                likedVideosList: allLikedVideos
            }
        )
    );
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}