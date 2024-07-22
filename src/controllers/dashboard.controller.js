import {Video} from "../models/video.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    
    const channelStats = await Video.aggregate(
        [
            {
                $match: {
                    owner: req.user?._id
                }
            },
            {
                $lookup: {
                    from: "subscription",
                    localField: "owner",
                    foreignField: "channel",
                    as: "allSubscribersList"
                }
            },
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "video",
                    as: "allLikes"
                }
            },
            {
                $group: {
                    _id: "$owner",
                    totalViews: { $sum: "$views" },
                    totalVideos: { $sum: 1 },
                    totalLikes: { $sum: { $size: "$allLikes" } },
                    totalSubscribers: { $sum: { $size: "$allSubscribersList" } },
                }
            }
        ]
    );

    if (!channelStats || channelStats.length === 0) {
        throw new ApiError(404, "Channel stats not found");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channelStats[0], "Channel stats fetched successfully")
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
    // Get all the videos uploaded by the channel

    const channelVideos = await Video.aggregate(
        [
            {
                $match: {
                    owner: req.user?._id
                }
            },
            {
                $group: {
                    _id: "$owner",
                    allVideos: { $push:  "$_id" }
                }
            }
        ]
    );

    if (!channelVideos || channelVideos.length === 0) {
        throw new ApiError(404, "There is no video that is uploaded by the channel");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channelVideos[0], "All videos uploaded by the channel fetched successfully")
    );
});

export {
    getChannelStats, 
    getChannelVideos
}