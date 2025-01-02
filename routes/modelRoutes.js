const express = require('express');
const router = express.Router();
const User = require('../models/user');  // Assuming your User model is in the models folder
const path = require('path');
const fs = require('fs');

// GET route to display user dashboard with models
router.get('/user-dash', async (req, res) => {
  try {
    const userId = req.session.user;  // Assuming you're using sessions
    const user = await User.findById(userId).populate('models');

    if (!user) {
      
      return res.redirect("/login");
    }

    res.render('user-dash', { models: user.models });  // Render the dashboard with user models
  } catch (err) {
    console.error('Error fetching user dashboard:', err);
    res.status(500).send('Server Error');
  }
});

router.get('/user-dash/delete/:modelId', async (req, res) => {
  try {
    const userId = req.session.user;  // Get the user ID from the session
    const modelId = req.params.modelId;

    const user = await User.findById(userId);
    if (!user) {
      return res.redirect("/login");
    }

    // Find the model by its ID
    const modelIndex = user.models.findIndex(model => model._id.toString() === modelId);
    if (modelIndex === -1) {
      return res.status(404).send('Model not found');
    }

    const model = user.models[modelIndex];
    

    // Remove the model from the user's models array
    user.models.splice(modelIndex, 1);
    await user.save();
    req.session.flash = { type: "info", message: "Model Deleted Successfully." };
    res.redirect("/user-dash");
    
  } catch (err) {
    console.error('Error deleting model:', err);
    res.status(500).send('Server Error');
  }
});


module.exports = router;
