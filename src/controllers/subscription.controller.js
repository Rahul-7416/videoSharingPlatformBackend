import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleSubscription = asyncHandler(async (req, res) => {

    // toggle subscription
    const {channelId} = req.params;
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channelId!");
    }
    
    // finding if the subscription document already exists || User already subscribed to the channel
    const existingSubscription = await Subscription.aggregate(
        [
            {
                $match: {
                    $and: [
                        {
                            channel: mongoose.Types.ObjectId.createFromHexString(channelId)
                        },
                        {
                            subscriber: req.user?._id
                        }
                    ]
                }
            }
        ]
    );

    if (existingSubscription.length === 0) {
        // if: for subscribing
        const subscription = await Subscription.create(
            {
                subscriber: req.user?._id,
                channel: mongoose.Types.ObjectId.createFromHexString(channelId)
            }
        );
    
        const createdSubscription = await Subscription.findById(subscription._id);
    
        if (!createdSubscription) {
            throw new ApiError(500, "Something went wrong while creating subscription document");
        }
    
        return res
        .status(200)
        .json(
            new ApiResponse(200, createdSubscription, "User subscribed the channel successfully")
        );
    } else {
        // else: for unsubscribing
        await Subscription.findByIdAndDelete(existingSubscription[0]?._id);

        return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "User unsubscribed the channel")
        );
    }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params;
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channelId!");
    }

    const userChannelSusbscribers = await Subscription.aggregate(
        [
            {
                $match: {
                    channel: mongoose.Types.ObjectId.createFromHexString(channelId)
                }
            }
        ]
    );

    if (userChannelSusbscribers.length === 0) {
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    totalSubscribers: userChannelSusbscribers.length,
                    subscriptionsList: userChannelSusbscribers
                },
                "There is zero subscribers of the given channel"
            )
        );
    } else {
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    totalSubscribers: userChannelSusbscribers.length,
                    subscriptionsList: userChannelSusbscribers
                },
                "There is zero subscribers of the given channel"
            )
        );
    }
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;
    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriberId!");
    }

    const userSusbscribedToChannels = await Subscription.aggregate(
        [
            {
                $match: {
                    subscriber: mongoose.Types.ObjectId.createFromHexString(subscriberId)
                }
            }
        ]
    );

    if (userSusbscribedToChannels.length === 0) {
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    totalChannelSubscribed: userSusbscribedToChannels.length,
                    totalChannelSubscribedList: userSusbscribedToChannels
                },
                "There is zero subscribers of the given channel"
            )
        );
    } else {
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    totalChannelSubscribed: userSusbscribedToChannels.length,
                    totalChannelSubscribedList: userSusbscribedToChannels
                },
                "There is no channel subscribed by the user"
            )
        );
    }

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}