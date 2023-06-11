function checkAuthentication(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('messages', {'info': 'Need authentication to do it'});
    res.redirect('/authors/login');
}

function checkNotAuthentication(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

module.exports = {checkAuthentication, checkNotAuthentication};