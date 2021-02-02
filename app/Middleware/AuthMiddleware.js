var authService = require('../Service/UserService');
var StylerService = require('../Service/StylersService');
var BaseRepository = require('../Repository/BaseRepository');
var User = require('../Model/user');
var styler = require('../Model/stylers');
var UserRepo = new BaseRepository(User);
var StylerRepo = new BaseRepository(styler);

exports.authenticate = function (req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
        authService.verifyToken(token).then(decoded => {
            UserRepo.getSingleBy({ publicId: decoded.publicId }, '').then(data => {
                if (data == null) {
                    res.status(401).send({ success: false, message: "User does not exist" });
                } else {
                    req.auth = {
                        publicId: data.publicId,
                        email: decoded.email,
                        name: data.name,
                        Id: data._id,
                        oneSignalUserId: data.oneSignalUserId,
                    }
                    res.locals.response = { data: decoded, message: "", success: true };
                    next();
                }
            })
        }).catch(err => {
            res.status(401).send({ success: false, message: "Invalid token", data: err });
        })
    } else {
        res.status(401).send({ success: false, message: "No token provided" });
    }
}

exports.StylerAuthenticate = function (req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
        StylerService.verifyToken(token, userType = '').then(decoded => {
            StylerRepo.getSingleBy({ publicId: decoded.publicId }, '').then(data => {
                if (data == null) {
                    res.status(401).send({ success: false, message: "User does not exist" });
                } else {
                    req.auth = {
                        publicId: decoded.publicId,
                        email: decoded.email,
                        name: data.name,
                        role: data.role,
                        Id: data.id,
                        oneSignalUserId: data.oneSignalUserId,
                    }
                    res.locals.response = { data: decoded, message: "", success: true };
                    next();
                }
            })
        }).catch(err => {
            res.status(401).send({ success: false, message: "Invalid token", data: err });

        })
    } else {
        res.status(401).send({ success: false, message: "No token provided" });
    }
}

exports.authenticateAll = function (req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
        return authService.verifyToken(token).then(decoded => {
            return UserRepo.getSingleBy({ publicId: decoded.publicId }, '').then(async data => {
                var styler = await StylerRepo.getSingleBy({ publicId: decoded.publicId }, '')
                if (styler == null) {
                    return res.status(401).send({ success: false, message: "User does not exist" });
                } else {
                    req.auth = {
                        publicId: decoded.publicId,
                        email: decoded.email,
                        name: styler.name,
                        role: styler.role,
                        Id: data.id,
                        styler: styler.id,
                        oneSignalUserId: data.oneSignalUserId,
                    }
                    res.locals.response = { data: decoded, message: "", success: true };
                    next();
                }
            })
        }).catch(err => {
            res.status(401).send({ success: false, message: "Invalid token", data: err });
        })
    } else {
        res.status(401).send({ success: false, message: "No token provided" });
    }
}