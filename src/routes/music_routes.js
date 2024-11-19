const express = require('express');
const multer = require('multer');

const router = express.Router();
const Music = require('../models/music_model');
const path = require('path');
const fs = require('fs');

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    },
});
const upload = multer({
    storage: storage,
}).fields([
    { name: 'audioFiles', maxCount: 1 }, // Field name for audio file
    { name: 'playlistImage', maxCount: 1 }, // Field name for image file
]);



router.post('/upload', upload, async (req, res) => {

    try {
        const { playlistId, playlistTitle, audioTitle, audioDescription } = req.body;

        console.log("this is playlist id ", playlistId);
        if (!req.files['audioFiles']) {
            return res.status(400).json({ error: 'Audio file is required' });
        }

        const audioFile = req.files['audioFiles'][0];
        const audioFiles = `${req.protocol}://${req.get('host')}/uploads/${audioFile.filename}`;


        // Validate input


        let playlist = await Music.findOne({ playlistId });


        if (!playlist) {
            const playlistImage = req.files['playlistImage'][0]
            // If playlist doesn't exist, create a new one
            if (playlistTitle == null) {
                console.log(playlistTitle);


                return res.status(400).json({ error: 'Playlist title and is required to create a new playlist' });
            } else if (playlistImage == null) {
                console.log("playlistImage is null");
                return res.status(400).json({ error: ' Playlist image is required to create a new playlist' });
            }

            else {


                playlist = new Music({

                    playlistTitle,
                    playlistImage: `${req.protocol}://${req.get('host')}/uploads/${playlistImage.filename}`, // Add a default image if not provided
                    music: [], // Initialize the music array
                });
            }

        }

        // Add the new track to the playlist
        const newMusic = {

            audioFiles,
            audioTitle: audioTitle || path.parse(audioFile.originalname).name,
            audioDescription: audioDescription || '',
        };

        playlist.music.push(newMusic);
        await playlist.save();

        res.status(201).json({
            message: playlistId ? 'Music track added successfully' : 'New playlist created and music track added successfully',
            playlist,
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to add music track' });
    }

});

// API to fetch all music
router.get('/', async function (req, res) {
    try {
        const musicList = await Music.find();
        res.status(200).json(musicList);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch music' });
    }
});


router.delete('/deletePlaylist', async function (req, res) {
    try {
        const { playlistId, audioId } = req.body;
        if (!playlistId) {
            return res.status(400).json({ message: 'Both playlistId and audioId are required' });
        }

        // Find playlist using playlistId
        const playList = await Music.findOne({ playlistId });
        if (!playList) {
            return res.status(404).json({ message: 'Playlist not found' });
        }

        // Find and remove the audio track
        const musicItemIndex = playList.music.findIndex(m => m.audioId === audioId);
        if (musicItemIndex === -1) {
            return res.status(404).json({ message: 'Audio track not found' });
        }

        const deletedItem = playList.music.splice(musicItemIndex, 1)[0];

        // Optionally delete the audio file from the filesystem
        // deleteFile(path.resolve(deletedItem.audioFiles));
        deletedItem.audioFiles.forEach((e) => deleteFile(e));

        await playList.save();

        res.status(200).json({ message: 'Audio track deleted successfully', deletedItem });
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
// Helper function to delete files

// router.delete('/deletePlaylist', async function (req, res) {
//     try {
//         const { playlistId } = req.body;

//         if (!playlistId) {
//             return res.status(400).json({ message: 'ID is required' });
//         }

//         // Find the playlist in the database
//         const playList = await Music.findById(playlistId);

//         if (!playList) {
//             return res.status(404).json({ message: "Playlist not found" });
//         }

//         // Delete the playlist image file from the server
//         deleteFile(path.resolve(playList.playListImage));

//         // Delete all associated audio files from the server
//         playList.music.forEach((musicItem) => {
//             deleteFile(path.resolve(musicItem.audioUrl)); // Adjust path mapping if needed
//         });

//         // Delete the playlist from the database
//         const deletedItem = await Music.findByIdAndDelete(playlistId);

//         res.status(200).json({ message: 'Playlist deleted successfully', deletedItem });
//     } catch (error) {
//         console.error('Error deleting playlist:', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// });



// router.delete('/deletePlaylist/deleteMusic', async function (req, res) {
//     try {
//         // const { playlistId, audioId } = req.body;
//         const playlistId = req.body.playlistId;
//         const audioId = req.body.audioId;
//         if (!playlistId || !audioId) {
//             return res.status(400).json({ message: 'Both ID are required' });
//         }

//         const playList = await Music.findById(playlistId);
//         if (!playList) {
//             return res.statusCode(404).json({ message: "PlayList Not found" });
//         }

//         deleteFile(path.resolve(playList.music.audioFile));
//         // playList.music.forEach((musicItem) => deleteFile(path.resolve(musicItem)));

//         // const deletedItem = await Music.findByIdAndDelete(playlistId);
//         const deletedItem = playList.music.findByIdAndDelete(audioId);
//         if (!deletedItem) {
//             return res.status(404).json({ message: 'Item not found' });
//         }

//         res.status(200).json({ message: 'Item deleted successfully', deletedItem });
//     } catch (error) {
//         console.error('Error deleting item:', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// });

router.delete('/deletePlaylist/deleteMusic', async function (req, res) {
    try {
        const { playlistId, audioId } = req.body;
        if (!playlistId || !audioId) {
            return res.status(400).json({ message: 'Both playlistId and audioId are required' });
        }

        // Find playlist using playlistId
        const playList = await Music.findOne({ playlistId });
        if (!playList) {
            return res.status(404).json({ message: 'Playlist not found' });
        }

        // Find and remove the audio track
        const musicItemIndex = playList.music.findIndex(m => m.audioId === audioId);
        if (musicItemIndex === -1) {
            return res.status(404).json({ message: 'Audio track not found' });
        }

        const deletedItem = playList.music.splice(musicItemIndex, 1)[0];

        // Optionally delete the audio file from the filesystem
        deleteFile(path.resolve(deletedItem.audioFiles));

        await playList.save();

        res.status(200).json({ message: 'Audio track deleted successfully', deletedItem });
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({ message: 'Server error' });
    }
});



const deleteFile = (filePath) => {
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error(`Error deleting file ${filePath}:`, err);
        } else {
            console.log(`File deleted: ${filePath}`);
        }
    }

    );
};


module.exports = router;
