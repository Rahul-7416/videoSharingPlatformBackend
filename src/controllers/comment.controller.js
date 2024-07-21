import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import { Video } from "../models/video.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {

    // get all comments for a video
    const {videoId} = req.params;
    const {page = 1, limit = 10} = req.query;

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "No such video found");
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const options = {
        page: pageNum,
        limit: limitNum
    }

    const pipeline = [
        {
            $match: {
                video: mongoose.Types.ObjectId.createFromHexString(videoId)
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        }
    ];

    const response = await Comment.aggregatePaginate(Comment.aggregate(pipeline), options);

    return res
    .status(200)
    .json(
        new ApiResponse(200, response, "All comments fetched successfully")
    );

});

const addComment = asyncHandler(async (req, res) => {
    
    // add a comment to a video
    const { videoId } = req.params;
    const { content } = req.body;

    if (
        [videoId, content].some((field) => field.trim() === "")
    ) {
        throw new ApiError(400, "videoId and content of the message is required");
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user?._id
    });

    const createdComment = await Comment.findById(comment?._id);

    if (!createdComment) {
        throw new ApiError(500, "Something went wrong while registering the comment");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            comment,
            "Comment registered successfully"
        )
    )
})

const updateComment = asyncHandler(async (req, res) => {

    // update a comment
    const { commentId } = req.params;
    const { content } = req.body;
    if (
        [commentId, content].some((field) => field.trim() === "")
    ) {
        throw new ApiError(400, "commentId and content is required");
    }

    await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content
            }
        },
        {
            new: true
        }
    );

    const updatedComment = await Comment.findById(commentId);

    if (!updatedComment) {
        throw new ApiError(500, "Error occured while updating the comment's content");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedComment, "comment's content updated successfully")
    );

});

const deleteComment = asyncHandler(async (req, res) => {

    // delete a comment
    const { commentId } = req.params;
    if (!commentId) {
        throw new ApiError(400, "commentId is required");
    }

    const comment = await Comment.findById(commentId);

    if (comment === null || comment === undefined) {
        throw new ApiError(404, "No such comment exists");
    }

    await Comment.findByIdAndDelete(commentId);

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Comment deleted successfully")
    );

});

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}