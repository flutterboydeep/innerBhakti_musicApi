const mongoose = require('mongoose');
const { v4: uuid } = require('uuid');


const musicItemSchema = new mongoose.Schema({
    audioId: { type: String, default: uuid },
    audioFiles: { type: String, required: true },
    audioTitle: { type: String, required: true },
    audioDescription: { type: String, default: "" },
    audioCreatedAt: { type: Date, default: Date.now },
});

// Main schema for the playlist
const musicSchema = new mongoose.Schema({
    playlistId: { type: String, default: uuid },
    playlistTitle: { type: String, required: true },
    playlistImage: { type: String, required: true },
    music: [musicItemSchema],
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Music', musicSchema);

