const express = require('express');
const router = express.Router();
const User = require('../models/user');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Replace these with your actual API key and endpoints
const API_KEY = 'YS4TSY0-73RMPDT-NDC9GYS-6TCBJK4';
const BASE_URL = 'https://api.anything.world';

router.get('/animate/:modelId', async (req, res) => {
    try {
        const userId = req.session.user;
        const user = await User.findById(userId).exec();

        if (!user || !user.models || user.models.length === 0) {
            return res.status(404).send('No models found for this user.');
        }

        const modelId = req.params.modelId;
        const modelToAnimate = user.models.find(model => model._id.toString() === modelId);

        if (!modelToAnimate) {
            return res.status(404).send('Model not found.');
        }

        const combinePath = modelToAnimate.filePaths.find(file => file.type === 'combined')?.path;
        const combinedPath = path.join(__dirname, '../public', combinePath);

        if (!combinedPath) {
            return res.status(400).send('No valid model file path found.');
        }

        const fileContent = fs.readFileSync(combinedPath);
        const fileName = path.basename(combinedPath);
        const contentType = 'text/plain';

        const files = [[fileName, fileContent, contentType]];

        const requestBody = {
            key: API_KEY,
            model_name: modelToAnimate.name,
            symmetry: 'false',
            auto_classify: 'false',
            model_type: 'human',
            auto_rotate: 'true',
            files: files,
        };

        const animateResponse = await axios.post(`${BASE_URL}/animate`, requestBody, {
            headers: { 'Content-Type': 'application/json' },
        });

        const modelIdFromAPI = animateResponse.data.model_id;

        // Start long-polling loop to check if animation is complete
        let attempts = 0;
        const pollInterval = 5000; // 5 seconds
        const pollMaxAttempts = 20;
        let animatedFileUrl = null;

        while (attempts < pollMaxAttempts) {
            const statusResponse = await axios.get(`${BASE_URL}/user-processed-model`, {
                params: { model_id: modelIdFromAPI },
            });

            if (statusResponse.data.status === 'completed') {
                animatedFileUrl = statusResponse.data.file_path;
                break;
            }

            if (statusResponse.data.status === 'error') {
                return res.status(500).send('Error processing the model.');
            }

            await new Promise(resolve => setTimeout(resolve, pollInterval));
            attempts++;
        }

        if (!animatedFileUrl) {
            return res.status(408).send('Animation process timed out.');
        }

        const fileExtension = path.extname(animatedFileUrl);
        const savePath = path.join(__dirname, '../public/animated_models', `${modelId}${fileExtension}`);

        const fileResponse = await axios.get(animatedFileUrl, { responseType: 'stream' });
        const writer = fs.createWriteStream(savePath);

        fileResponse.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        res.render('animate', {
            animatedModelPath: `/animated_models/${modelId}${fileExtension}`,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while processing the request.');
    }
});

module.exports = router;
