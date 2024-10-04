const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');
const http = require('http');
const { HttpsAgent } = require('http-proxy-agent');

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
            responseType: 'stream', // Expecting file stream in return
            httpAgent: keepAliveAgent, // Use the keep-alive agent
            proxy: false // Disable proxy
        });

        // Clean up the local uploaded image file
        fs.unlinkSync(imgPath);

        // Define path where the .obj file will be saved
        const objFolderPath = path.join(__dirname, '../public/3Dmodels');
        const objFileName = `combined_model.glb`;; // Fixed name for .obj file
        const objFilePath = path.join(objFolderPath, objFileName);

        // Create a write stream to save the .obj file in the /3Dmodels/ folder
        const writeStream = fs.createWriteStream(objFilePath);

        // Pipe the incoming .obj file data from Flask response to the local file
        response.data.pipe(writeStream);

        writeStream.on('finish', () => {
            console.log(`.obj file saved as: ${objFilePath}`);
            res.redirect('/try-now#at-main');
        });

        writeStream.on('error', (err) => {
            console.error('Error saving .obj file:', err);
            res.status(500).send('Failed to save the .obj file.');
        });
    } catch (error) {
        console.error('Error uploading image or saving .obj file:', error);
        res.status(500).send('Failed to upload image or save .obj file.');
    }
});

module.exports = router;