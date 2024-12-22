const express = require('express');
const router = express.Router();
const User = require('../models/user'); 
const fs = require('fs');
const path = require('path');

router.post('/delete-account', async (req, res) => {
    try {
        const userId = req.session.user._id; // Get user ID from session or request
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Delete associated files
        for (const model of user.models) {
            for (const file of model.filePaths) {
                const filePath = path.join(__dirname, 'public/3DModels', file.path); // Adjust the path based on your structure
                
                // Check if the file exists before attempting deletion
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath); // Delete the file
                }
            }
        }

        // Now delete the user document
        await User.deleteOne({ _id: userId });
        
        // Destroy the session and redirect to the signup page
        req.session.user = null;
        req.session.flash = { type: "info", message: "Account Deleted Successfully." };
        res.redirect("signup");
    } catch (error) {
        console.error("Error deleting account:", error);
        res.status(500).json({ error: "Failed to delete account" });
    }
});

module.exports = router;