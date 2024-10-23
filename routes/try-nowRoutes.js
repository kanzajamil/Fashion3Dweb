const express = require('express');
const router = express.Router();
const checkAuthenticated = require('../middleware/auth'); // Import the middleware

router.get('/try-now', checkAuthenticated, (req, res) => {
    let modelPath = null;
    

    res.render('try-now', { modelPath });
});

module.exports = router;
