const express = require('express');
const router = express.Router();
const session = require('express-session')
const User = require('../models/user'); // Adjust the path
const mergeObjFiles = require('../utils/combinemodels');
const fs = require('fs');
const path = require('path');

//const { loadtextures } = require('../public/js/functions.js');


router.get('/modeledit/:modelId', async (req, res) => {
    
    try {
        const userId = req.session.user;
        const user = await User.findById(userId).exec();

        if (!user || !user.models || user.models.length === 0) {
            return res.status(404).send('No models found for this user.');
        }

        const modelId = req.params.modelId;
        const modelToEdit = user.models.find(model => model._id.toString() === modelId);

        if (!modelToEdit) {
            return res.status(404).send('Model not found.');
        }

        // Get paths for 'upper', 'bottom', and 'SMPL' parts from the model
        const upperPath = modelToEdit.filePaths.find(file => file.type === 'upper')?.path;
        const bottomPath = modelToEdit.filePaths.find(file => file.type === 'bottom')?.path;
        const smplPath = modelToEdit.filePaths.find(file => file.type === 'smpl')?.path;
        const mergePath = modelToEdit.filePaths.find(file => file.type === 'combined')?.path;

        if (!upperPath || !bottomPath || !smplPath) {
            return res.status(400).send('Model parts are missing.');
        }

        const fullUpperPath = path.join(__dirname, '../public', upperPath);
        const fullBottomPath = path.join(__dirname, '../public', bottomPath);
        const fullSmplPath = path.join(__dirname, '../public', smplPath);
        const fullMergePath = path.join(__dirname, '../public', mergePath);

         // Extract textures from the model schema
        let topTexturePath = modelToEdit.textures.top;     // Texture for top
        let bottomTexturePath = modelToEdit.textures.bottom;  // Texture for bottom
        let bodyTexturePath = modelToEdit.textures.body;      // Texture for body
 
         // Call the function from functions.js with the texture paths
         //loadtextures(topTexturePath, bottomTexturePath, bodyTexturePath);

       
        // Read the merged model file to count vertices and faces
        fs.readFile(fullMergePath, 'utf-8', (err, data) => {
            if (err) {
                console.error('Error reading the file:', err);
                return res.status(500).send('Error reading the merged model.');
            }

            const lines = data.split('\n');
            const vertices = lines.filter(line => line.startsWith('v ')).length;
            const faces = lines.filter(line => line.startsWith('f ')).length;

            // Store vertices and faces in the session
            req.session.vertices = vertices;
            req.session.faces = faces;

            // Access the session data and render the page
            const vert = req.session.vertices;
            const face = req.session.faces;

            console.log(`Vertices: ${vert}`);
            console.log(`Faces: ${face}`);

            // Render the 'modeledit' page and pass the merged model path and counts
            res.render('modeledit', {
                scrollTo: 'at-main',
                vertices: vert,
                faces: face,
                upperModelPath: upperPath || '',
                lowerModelPath: bottomPath || '',
                smplModelPath: smplPath || '',
                mergedModelPath: mergePath,
                modelId: modelToEdit._id, // Pass the model ID to the edit form
                topTexture: topTexturePath || '',   // Pass the top texture path
                bottomTexture: bottomTexturePath || '', // Pass the bottom texture path
                bodyTexture: bodyTexturePath || '' 
            }
        );
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});





router.get('/modeledit/:modelId', async (req, res) => {
   // console.log("sdfghjkDFCGVBHN");
    try {
        const userId = req.session.user;
        const user = await User.findById(userId).exec();

        if (!user || !user.models || user.models.length === 0) {
            return res.status(404).send('No models found for this user.');
        }

        // Find the specific model by ID from the URL parameter
        const modelId = req.params.modelId;
        const modelToEdit = user.models.find(model => model._id.toString() === modelId);

        if (!modelToEdit) {
            return res.status(404).send('Model not found.');
        }
        console.log();
        // Find the file paths for 'upper', 'bottom', and 'SMPL' types from the selected model
        let latestUpperModelPath = modelToEdit.filePaths.find(file => file.type === 'upper')?.path;
        let latestBottomModelPath = modelToEdit.filePaths.find(file => file.type === 'bottom')?.path;
        let latestSMPLModelPath = modelToEdit.filePaths.find(file => file.type === 'smpl')?.path;

       

        

        // Example usage
        const filePaths = [
            path.join(__dirname, '/model/pants.obj'),
            path.join(__dirname, '/model/body.obj'),
            path.join(__dirname, '/model/top.obj')
        ];
        const outputFile = path.join(__dirname, 'merged_model.obj');

        // Call the function to merge the .obj files with axis inversion


        mergeObjFiles(filePaths, outputFile, ['y', 'z']);





        // Render the 'modeledit' page and pass the specific model paths
        res.render('modeledit', {
            upperModelPath: latestUpperModelPath || '',  
            lowerModelPath: latestBottomModelPath || '',  
            smplModelPath: latestSMPLModelPath || '',
            modelId: modelToEdit._id  // Pass the model ID to the edit form
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.post('/modeledit/:modelId/save-textures', async (req, res) => {
    try {
        const userId = req.session.user;
        const modelId = req.params.modelId;
        const { top, bottom, body } = req.body;

        const user = await User.findById(userId).exec();
        if (!user) {
            return res.status(404).send('User not found.');
        }

        const modelToEdit = user.models.find(model => model._id.toString() === modelId);
        if (!modelToEdit) {
            return res.status(404).send('Model not found.');
        }

        // Update the textures in the schema
        modelToEdit.textures.top = top || modelToEdit.textures.top;
        modelToEdit.textures.bottom = bottom || modelToEdit.textures.bottom;
        modelToEdit.textures.body = body || modelToEdit.textures.body;

        // Save changes
        await user.save();
        
        res.status(200).json({ message: 'Textures updated successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});


router.post('/modeledit/:modelId/save-as', async (req, res) => {
    try {
        const userId = req.session.user; // Get the logged-in user's ID from the session
        const modelId = req.params.modelId; // The ID of the model to duplicate
        const { top, bottom, body, newTitle } = req.body; // New textures and optional new title

        // Find the user
        const user = await User.findById(userId).exec();
        if (!user) {
            return res.status(404).send('User not found.');
        }

        // Find the model to duplicate
        const modelToDuplicate = user.models.id(modelId);
        if (!modelToDuplicate) {
            return res.status(404).send('Model not found.');
        }

        // Create a duplicate model with updated textures and optional new title
        const duplicatedModel = {
            title: newTitle || `${modelToDuplicate.title}_copy`, // Use new title or append "_copy"
            date: Date.now(), // New creation date
            filePaths: [...modelToDuplicate.filePaths], // Copy file paths
            textures: {
                top: top || modelToDuplicate.textures.top,
                bottom: bottom || modelToDuplicate.textures.bottom,
                body: body || modelToDuplicate.textures.body,
            },
        };

        // Add the duplicate model to the user's models array
        user.models.push(duplicatedModel);

        // Save the updated user document
        await user.save();

        res.status(201).json({
            message: 'Model duplicated successfully.',
            duplicatedModel,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});




// Route to fetch the latest 'upper' model for a user
/*router.get('/modeledit', async (req, res) => {
    try {
        const userId = req.session.user;
        const user = await User.findById(userId).exec();

        if (!user || !user.models || user.models.length === 0) {
            return res.status(404).send('No models found for this user.');
        }

        // Get the most recent model (the last one in the array)
        const latestModel = user.models[user.models.length - 1];

        // Find the file path for 'upper' and 'bottom' types from the latest model
        let latestUpperModelPath = null;
        let latestBottomModelPath = null;

        if (latestModel) {
            latestUpperModelPath = latestModel.filePaths.find(file => file.type === 'upper')?.path;
            latestBottomModelPath = latestModel.filePaths.find(file => file.type === 'bottom')?.path;
        }

        if (!latestUpperModelPath && !latestBottomModelPath) {
            return res.status(404).send('No "upper" or "bottom" model found.');
        }

        console.log('Upper Model Path:', latestUpperModelPath);
        console.log('Bottom Model Path:', latestBottomModelPath);

        // Render the 'modeledit' page and pass both dynamic file paths
        res.render('modeledit', {
            upperModelPath: latestUpperModelPath,  // Ensure at least an empty string is passed
            lowerModelPath: latestBottomModelPath  // Ensure at least an empty string is passed
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});*/

module.exports = router;