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

        // Define path where the .obj file will be saved
        //const objFolderPath = path.join(__dirname, '../public/3Dmodels');
        //const objFileName = `combined_model.glb`;; // Fixed name for .obj file
        //const objFilePath = path.join(objFolderPath, objFileName);

        // Create a write stream to save the .obj file in the /3Dmodels/ folder
        //const writeStream = fs.createWriteStream(objFilePath);

        // Pipe the incoming .obj file data from Flask response to the local file
        //response.data.pipe(writeStream);

        /*writeStream.on('finish', async () => {
            try {
                console.log(`.obj file saved as: ${objFilePath}`);
        
                // Find the logged-in user via the session
                const user = req.session.user;
                if (!user) {
                    return res.status(401).send('User not logged in');
                }
        
                // Find the user by ID and update their models array
                const foundUser = await User.findById(user._id);
                if (foundUser) {
                    foundUser.models.push({
                        title: modelTitle, // Model title from the form
                        filePath: objFilePath, // Path where the .obj file was saved
                    });
                    await foundUser.save(); // Save the updated user document
                }
        
                // Redirect to the view page after successful file save and user update
                res.redirect('/try-now#at-main');
            } catch (error) {
                console.error('Error while updating user model:', error);
                res.status(500).send('Failed to update user model.');
            }
        });
        

        writeStream.on('error', (err) => {
            console.error('Error saving .obj file:', err);
            res.status(500).send('Failed to save the .obj file.');
        }); */
        const zipFilePath = path.join(__dirname, '../uploads/temp.zip');
        const objFolderPath = path.join(__dirname, '../public/3Dmodels');
        fs.writeFileSync(zipFilePath, response.data); // Save the response data (zipped folder)

        // Unzip the received folder
        const zip = new AdmZip(zipFilePath);
        zip.extractAllTo(objFolderPath, true); // Extract to specified folder

        const baseFileName = path.basename(req.file.filename, path.extname(req.file.filename)); // Get base name without extension
        //const filePathUp = path.join(objFolderPath, `${baseFileName}_up.obj`);
        //const filePathBottom = path.join(objFolderPath, `${baseFileName}_bottom.obj`);
        //const filePathSmpl = path.join(objFolderPath, `${baseFileName}_smpl.obj`);
        //const filePathCombined = path.join(objFolderPath, `${baseFileName}_merged.obj`);

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
                filePaths: filePaths // Save all file paths
            });
            await foundUser.save(); // Save the updated user document
        }

        // Clean up the zipped file
        fs.unlinkSync(zipFilePath);
        
        
        // Redirect to the view page after successful file save and user update
        //res.redirect('/try-now#at-main');
        res.render('try-now', {modelPath});
        //res.redirect(`/try-now?modelPath=${encodeURIComponent(modelPath)}`);
        //req.session.modelPath = null;
    } catch (error) {
        console.error('Error uploading image or saving .obj file:', error);
        res.status(500).send('Failed to upload image or save .obj file.');
    }
});

module.exports = router;