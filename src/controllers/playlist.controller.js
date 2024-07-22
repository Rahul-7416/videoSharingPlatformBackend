import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    
    // create playlist

    const {name, description} = req.body;

    if (
        [name, description].some((field) => field.trim() === "")
    ) {
        throw new ApiError(400, "playlist's name and description are required");
    }

    const existingPlaylist = await Playlist.aggregate(
        [
            {
                $match: {
                    name
                }
            }
        ]
    );

    if (existingPlaylist.length === 1) {
        throw new ApiError(409, "Playlist already exists");
    } 
    else if (existingPlaylist.length === 0) {
        const playlist = await Playlist.create(
            {
                name,
                description,
                videos: [],
                owner: req.user?._id
            }
        );

        const createdPlaylist = await Playlist.findById(playlist._id);

        if (!createdPlaylist) {
            throw new ApiError(500, "Something went wrong while creating a playlist");
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200, createdPlaylist, "Playlist created successfully")
        );
    }
});

const getUserPlaylists = asyncHandler(async (req, res) => {

    // get user playlists

    const {userId} = req.params;
    if (!userId) {
        throw new ApiError(400, "userId is required");
    }

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid userId");
    }

    const userPlaylists = await Playlist.aggregate(
        [
            {
                $match: {
                    owner: mongoose.Types.ObjectId.createFromHexString(userId)
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
                totalPlaylists: userPlaylists.length,
                allPlaylistsList: userPlaylists
            }
        )
    );
    
});

const getPlaylistById = asyncHandler(async (req, res) => {
    
    // get playlist by id
    
    const {playlistId} = req.params;

    if (!playlistId) {
        throw new ApiError(400, "playlistId is required");
    }

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlistId");
    }

    const playlist = await Playlist.findById(mongoose.Types.ObjectId.createFromHexString(playlistId));

    if (!playlist) {
        throw new ApiError(404, "No playlist found with the given playlistId");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "Playlist fetched successfully")
    );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    
    // adding given video to a given playlist

    const {playlistId, videoId} = req.params;

    if (
        [playlistId, videoId].some((field) => field.trim() === 0)
    ) {
        throw new ApiError(400, "playlistId and videoId is required");
    }

    if (
        [playlistId, videoId].some((field) => !isValidObjectId(field))
    ) {
        throw new ApiError(400, "Invalid playlistId or videoId");
    }

    const playlist = await Playlist.findById(mongoose.Types.ObjectId.createFromHexString(playlistId));

    if (playlist.videos.find((ObjectId) => ObjectId.toString() === videoId)) {
        throw new ApiError(404, "Video already added to the playlist");
    }

    playlist.videos.push(mongoose.Types.ObjectId.createFromHexString(videoId));

    await playlist.save();

    const updatedPlaylist = await Playlist.findById(playlist._id);

    if (!updatedPlaylist) {
        throw new ApiError(500, "Something went wrong while adding video to the playlist");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            updatedPlaylist,
            "Video added successfully to the playlist"
        )
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    // remove video from playlist
    
    const {playlistId, videoId} = req.params;

    if (
        [playlistId, videoId].some((field) => field.trim() === 0)
    ) {
        throw new ApiError(400, "playlistId and videoId is required");
    }

    if (
        [playlistId, videoId].some((field) => !isValidObjectId(field))
    ) {
        throw new ApiError(400, "Invalid playlistId or videoId");
    }

    const playlist = await Playlist.findById(mongoose.Types.ObjectId.createFromHexString(playlistId));

    const index = playlist.videos.findIndex((ObjectId) => ObjectId.toString() === videoId);
    if (index !== -1) {
        playlist.videos.splice(index, 1);
    }

    await playlist.save();

    const updatedPlaylist = await Playlist.findById(playlist._id);

    if (!updatePlaylist) {
        throw new ApiError(500, "Something went wrong while deleting the video from the playlist");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedPlaylist, "Video deleted from the playlist successfully")
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
    // delete playlist
    const {playlistId} = req.params;

    if (!playlistId) {
        throw new ApiError(400, "playlistId is required");
    }

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlistId");
    }

    const playlist = await Playlist.findByIdAndDelete(mongoose.Types.ObjectId.createFromHexString(playlistId));

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Playlist deleted successfully")
    );
});

const updatePlaylist = asyncHandler(async (req, res) => {
    
    // update playlist
    
    const {playlistId} = req.params;

    if (!playlistId) {
        throw new ApiError(400, "playlistId is required");
    }

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlistId");
    }

    const {name, description} = req.body;

    if (
        [name, description].some((field) => field.trim() === "") 
    ) {
        throw new ApiError(400, "name and description are required");
    }

    const playlist = await Playlist.findByIdAndUpdate(
        mongoose.Types.ObjectId.createFromHexString(playlistId),
        {
            $set: {
                name,
                description
            }
        },
        {
            new: true
        }
    );

    const updatedPlaylist = await Playlist.findById(playlist._id);

    if (!updatedPlaylist) {
        throw new ApiError(500, "Something went wrong while updating the playlist");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedPlaylist, "Playlist updated successfully")
    );
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}