const jwt = require('jsonwebtoken');
const authorizeAdmins = (req, res, next) => {
    if(req.cookies.accessToken){
        const decoded = jwt.verify(req.cookies.accessToken, process.env.JWT_SECRET);
        if(decoded.role === 'admin') {
            req.body.id = decoded.id;
            return next();
        }
        return res.status(401).json({
            error: 'Unauthorized'
        });
    }
    return res.status(401).json({
        error: 'Please login first to access this resource'
    });
}

const isLoggedIn = (req, res, next) => {
    if(req.cookies.accessToken){
        const decoded = jwt.verify(req.cookies.accessToken, process.env.JWT_SECRET);
        req.body.id = decoded.id;
        return next();
    }
    return res.status(401).json({
        error: 'Please login first to access this resource'
    });
}

module.exports = {
    authorizeAdmins,
    isLoggedIn
}