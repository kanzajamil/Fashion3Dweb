function ensureAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        // User is authenticated, proceed to the next middleware or route handler
        return next();
    } else {
        // User is not authenticated, redirect to login page
        res.redirect('/login');
    }
}

module.exports = ensureAuthenticated;