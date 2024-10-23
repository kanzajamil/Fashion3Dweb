  module.exports = async function  (req, res, next) {
    res.locals.user = req.session.user || null;
    res.locals.flash = req.session.flash;
    req.session.flash = null;
    
    next();
  };