const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');
const AdmZip = require('adm-zip');
const http = require('http');
const { HttpsAgent } = require('http-proxy-agent');
const User = require('../models/user');

// Multer setup to store file in "uploads" folder
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

const keepAliveAgent = new http.Agent({
    keepAlive: true // Enable keep-alive
});

router.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const imgPath = req.file.path; // Path of the uploaded file
    const { title } = req.body;
    try {
        // Prepare form data
        const formData = new FormData();
        formData.append('file', fs.createReadStream(imgPath), {
            filename: req.file.filename,
            contentType: req.file.mimetype
        });

        // Send image to Flask app
        const response = await axios.post('http://condor-pro-puma.ngrok-free.app/upload', formData, {
            headers: {
                ...formData.getHeaders(),
                'ngrok-skip-browser-warning': 'any' // Add this header to skip the warning
            },
            responseType: 'arraybuffer', // Expecting file stream in return
            httpAgent: keepAliveAgent, // Use the keep-alive agent
            proxy: false // Disable proxy
        });

        // Clean up the local uploaded image file
        fs.unlinkSync(imgPath);

        
        const zipFilePath = path.join(__dirname, '../uploads/temp.zip');
        const objFolderPath = path.join(__dirname, '../public/3Dmodels');
        fs.writeFileSync(zipFilePath, response.data); // Save the response data (zipped folder)

        // Unzip the received folder
        const zip = new AdmZip(zipFilePath);
        zip.extractAllTo(objFolderPath, true); // Extract to specified folder

        const baseFileName = path.basename(req.file.filename, path.extname(req.file.filename)); // Get base name without extension

        // Prepare file paths for the user model
        const filePaths = [
            { type: 'upper', path: `/3Dmodels/${baseFileName}_up.obj` },
            { type: 'bottom', path: `/3Dmodels/${baseFileName}_bottom.obj`},
            { type: 'smpl', path: `/3Dmodels/${baseFileName}_smpl.obj` },
            { type: 'combined', path: `/3Dmodels/${baseFileName}_merged.obj` }
        ];

        // Find the logged-in user via the session
        const user = req.session.user;
        if (!user) {
            return res.status(401).send('User not logged in');
        }
        let modelPath = null;
        // Find the user by ID and update their models array
        const foundUser = await User.findById(user._id);
        if (foundUser) {
            modelPath= filePaths.find(fp => fp.type === 'combined').path;
            foundUser.models.push({
                title: title, // Model title from the form
                filePaths: filePaths, // Array of model file paths
                textures: {
                    top: null,
                    bottom: null,
                    body: null
                  }
            });
            await foundUser.save(); // Save the updated user document
        }
        req.session.user = foundUser.toObject();
        
        // Clean up the zipped file
        fs.unlinkSync(zipFilePath);
        
        
        res.render('try-now', { 
            modelPath, 
            latestModelId: foundUser.models[foundUser.models.length - 1]._id 
        });
    } catch (error) {
        console.error('Error uploading image or saving .obj file:', error);
        res.status(500).send('Failed to upload image or save .obj file.');
    }
});

module.exports = router;