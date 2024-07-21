import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    // create tweet
    if (!isValidObjectId(req.user?._id)) {
        throw new ApiError(400, "Invalid userId!");
    }
    
    const { content } = req.body;
    if (!content) {
        throw new ApiError(400, "Tweet's content is required");
    }

    const tweet = await Tweet.create(
        {
            content,
            owner: req.user?._id
        }
    );

    const createdTweet = await Tweet.findById(tweet._id);

    if (!createdTweet) {
        throw new ApiError(500, "Something went wrong while registering the tweet");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, createdTweet, "tweet created successfully")
    );
});

const getUserTweets = asyncHandler(async (req, res) => {
    // get user tweets
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid userId");
    }

    const pipeline = [
        {
            $match: {
                owner: mongoose.Types.ObjectId.createFromHexString(userId)
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        }
    ];

    const response = await Tweet.aggregate(pipeline);

    if (!response) {
        throw new ApiError(500, "Something went wrong while fetching the tweets");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, response, "All tweets fetched successfully")
    );

});

const updateTweet = asyncHandler(async (req, res) => {
    // update tweet
    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweetId");
    }

    const { content } = req.body;

    if (!content) {
        throw new ApiError(400, "content is required to update tweet's content");
    }

    const tweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content
            }
        },
        {
            new: true
        }
    );

    const updatedTweet = await Tweet.findById(tweet._id);

    if (!updatedTweet) {
        throw new ApiError(500, "Something went wrong while updating the tweet");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedTweet, "tweet updated successfully")
    );
});

const deleteTweet = asyncHandler(async (req, res) => {
    // delete tweet
    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweetId");
    }

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "No such tweet exists!");
    }

    await Tweet.deleteOne(tweet._id);

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Tweet deleted successfully")
    );
});

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}