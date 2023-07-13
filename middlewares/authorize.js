const jwt = require('jsonwebtoken');

const authorizeAdmins = (req, res, next) => {   // Middleware to authorize admins
    if(req.cookies.accessToken){    // If the access token is present in the cookie
        const decoded = jwt.verify(req.cookies.accessToken, process.env.JWT_SECRET);    // Verify the access token
        if(decoded.role === 'admin') {  // If the role is admin, then authorize the user
            req.body.id = decoded.id;   // Add the id to the request body
            return next();
        }
        return res.status(401).json({   // If the role is not admin, then send the error response
            error: 'Unauthorized'
        });
    }
    return res.status(401).json({
        error: 'Please login first to access this resource'
    });
}

const isLoggedIn = (req, res, next) => {    // Middleware to check if the user is logged in
    if(req.cookies.accessToken){    // If the access token is present in the cookie
        const decoded = jwt.verify(req.cookies.accessToken, process.env.JWT_SECRET);    // Verify the access token
        req.body.id = decoded.id;   // Add the id to the request body
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