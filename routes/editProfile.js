const express = require('express');
const router = express.Router();
const User = require('../models/user'); 
const crypto = require("crypto");
const nodemailer = require("nodemailer");// Adjust the path according to your project structure
//const { ensureAuthenticated } = require('../middleware/auth'); // Middleware to ensure user is authenticated

// Route to update user name
router.post('/update-name', async (req, res) => {
    try {
        // Extract the new name from the request body
        const newName = req.body.name;
        console.log('Updating name to:', newName); // Log to check if this route is hit

        let user = req.session.user;
        // Check if the user ID is in the session
        if (!user) {
            return res.status(401).send('User not authenticated'); // Unauthorized
        }

        // Find the user by ID from the session
        const foundUser = await User.findById(user._id); // Assuming user ID is stored in session

        if (foundUser) {
            // Update the user's name
            foundUser.name = newName; // Update name

            // Optionally, you can update other fields or perform additional checks here

            // Save the updated user document
            await foundUser.save();

            // Update the session with the new user data if needed
             // Save updated user data in session
             req.session.user = foundUser.toObject();
             

            console.log('User name updated successfully:', foundUser.name);
            req.session.flash = { type: "success", message: "Name Updated Successfully." };
  
            res.render('settings'); // Redirect back to settings or wherever you need
        } else {
            return res.status(404).send('User not found'); // Handle case where user does not exist
        }
    } catch (err) {
        console.error('Error updating name:', err);
        res.status(500).send('Error updating name'); // Handle error response
    }
});


// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "3dfashionn@gmail.com",
      pass: "dowp lbpl ugeu qlnp",
    },
});

// Generate OTP function
function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit OTP
}

// Helper function to send email
function sendEmail(recipient, subject, message) {
    const mailOptions = {
        from:'"Fashion3D" <3dfashionn@gmail.com>' ,
        to: recipient,
        subject: subject,
        text: message,
    };

    return transporter.sendMail(mailOptions);
}

// Route to send OTP
router.post('/send-otp', async (req, res) => {
    const otp = generateOtp(); // Generate a 6-digit OTP
    req.session.otp = otp; // Store OTP in session
    const userEmail = req.session.user.email; // Get the current user's email

    try {
        await sendEmail(userEmail, 'Your OTP Code', `Your OTP is: ${otp}`);
        res.json({ message: "OTP sent successfully" });
    } catch (error) {
        console.error("Error sending OTP:", error);
        res.status(500).json({ error: "Error sending OTP" });
    }
});

// Route to verify OTP
router.post('/verify-otp', (req, res) => {
    const userOtp = req.body.otp;

    if (userOtp === req.session.otp) {
        req.session.otpVerified = true; // Mark OTP as verified
        delete req.session.otp; // Clear OTP from session after verification
        res.json({ message: "OTP verified successfully" });
    } else {
        res.status(400).json({ error: "Invalid OTP" });
    }
});

// Route to update email
router.post('/update-email', async (req, res) => {
    if (!req.session.otpVerified) {
        return res.status(403).json({ error: "OTP verification required" });
    }

    const newEmail = req.body.newEmail;
    const userId = req.session.user._id; // Assuming user ID is available in the session

    try {
        

        const foundUser = await User.findById(userId); // Assuming user ID is stored in session
        req.session.otpVerified = false;
        if (foundUser) {
            // Update the user's name
            foundUser.email = newEmail; // Update name

            // Optionally, you can update other fields or perform additional checks here

            // Save the updated user document
            await foundUser.save();
        }
            // Update the session with the new user data if needed
             // Save updated user data in session
            req.session.user = foundUser.toObject();
             

            console.log('Emai updated successfully:', foundUser.email);
            req.session.flash = { type: "success", message: "Email Updated Successfully." };
  
            res.render('settings'); 
    } catch (error) {
        console.error("Error updating email:", error);
        res.status(500).json({ error: "Failed to update email" });
    }
});

module.exports = router;
