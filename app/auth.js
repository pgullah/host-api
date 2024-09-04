/* let jwt = require('jsonwebtoken')
function jwtAuth(req, res, next) {
    const bearerHeader = req.headers["authorization"] || req.headers["Authorization"]
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(" ");
        const bearerToken = bearer[1];
        const API_SECRET = process.env['API_SECRET'];
        jwt.verify(bearerToken, API_SECRET, (err, result) => {
            if (err) { res.sendStatus(403) }
            else { next(); }
        });
    }
    else {
        res.sendStatus(403)
    }
} */

module.exports.verify = (req, res, next) => {
    if (req.session.user != null) {
        next();
    } else {
        res.sendStatus(403);
    }
};

module.exports.distroy = (req, _, next) => {
    req.session.distroy((err) => {
        next();
    });
    
};