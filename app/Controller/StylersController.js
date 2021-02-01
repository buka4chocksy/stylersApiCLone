var StylersService = require('../Service/StylersService');
var cloudinary = require('../Middleware/cloudinary')
var mongoose = require('mongoose');

module.exports = function authController() {
    this.register = (req, res, next) => {
        StylersService.RegisterUser(Object.assign(req.body, { publicId: mongoose.Types.ObjectId() })).then((data) => {
            res.json(data);
        }).catch((err) => {
            res.json(err);
        })
    }

    this.authenticate = function (req, res, next) {
        var username = req.body.username
        var password = req.body.password
        StylersService.authenticateuser(username, password)
            .then(data => res.status(200).send(data))
            .catch(err => res.status(500).send(err));
    }

    this.stylerRegStatus = function (req, res, next) {
        StylersService.StylerRegStatus(req.auth.Id)
            .then(data => res.status(200).send(data))
            .catch(err => res.status(500).send(err));
    }

    this.passwordToken = function (req, res, next) {
        var gen = Math.floor(1000 + Math.random() * 9000);
        var data = {
            email: req.body.email,
            passwordToken: gen
        };
        StylersService
            .forgotPasswordToken(data)
            .then(data => res.status(200).send(data))
            .catch(err => res.status(500).send(err));
    };


    this.changeforgotPassword = function (req, res, next) {
        var data = {
            passwordToken: req.body.passwordToken,
            password: req.body.password
        };
        StylersService
            .changeforgotPassword(data)
            .then(data => res.status(200).send(data))
            .catch(err => res.status(500).send(err));
    };

    this.changePassword = function (req, res, next) {
        var data = {
            originalPassword: req.body.originalPassword,
            password: req.body.password,
            email: req.auth.email
        };
        StylersService
            .changepassword(data)
            .then(data => res.status(200).send(data))
            .catch(err => res.status(500).send(err));
    };

    // this.AddServices = function (req, res, next) {
    //     var data = { adult: req.body.adults, child: req.body.kids, serviceId: req.body.service }
    //     StylersService.AddServicePrice(req.params.id, data)
    //         .then(data => res.status(200).send(data))
    //         .catch(err => res.status(500).send(err));
    // }

    this.GetStylers = function (req, res, next) {
        StylersService.getStylers(req.params.pagenumber, req.params.pagesize)
            .then(data => res.status(200).send(data))
            .catch(err => res.status(500).send(err));
    }

    this.SortStylers = function (req, res, next) {
        StylersService.sortStylers({})
            .then(data => res.status(200).send(data))
            .catch(err => res.status(500).send(err));
    }

    this.SortStylersByPrice = function (req, res, next) {
        StylersService.sortStylersByPrice(req.params.id, JSON.parse(req.query.coordinates))
            .then(data => res.status(200).send(data))
            .catch(err => res.status(500).send(err));
    }

    this.SortStylersByRating = function (req, res, next) {
        StylersService.sortStylersByRating(req.params.id, JSON.parse(req.query.coordinates))
            .then(data => res.status(200).send(data))
            .catch(err => res.status(500).send(err));
    }

    this.GetStylerDetails = function (req, res, next) {
        console.log(req.auth.Id)
        StylersService.getStylerDetails(req.auth.Id)
            .then(data => res.status(200).send(data))
            .catch(err => res.status(500).send(err));
    }

    this.GetStyler = function (req, res, next) {
        StylersService.getStylerById(req.params.id)
            .then(data => res.status(200).send(data))
            .catch(err => res.status(500).send(err));
    }

    this.UpdateServices = function (req, res, next) {
        // var data = { amount: req.body.price, serviceId: req.body.service }
        StylersService.UpdateServicePrice(req.auth.Id, req.body.services)
            .then(data => res.status(200).send(data))
            .catch(err => res.status(500).send(err));
    }

    this.updateClientAvatar = async (req, res) => {
        var requestDetails = {};
        if (req.body.image) {
            requestDetails.imageUrl = req.body.image.secure_url;
            requestDetails.imageID = req.body.image.public_id;
        }

        StylersService.updateAvatar(req.auth.publicId, requestDetails)
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(500).send(err);
            });
    };

    this.updateClientProfile = async (req, res) => {
        var requestDetails = { ...req.body };
        if (req.body.image) {
            requestDetails.imageUrl = req.body.image.secure_url;
            requestDetails.imageID = req.body.image.public_id;
        }
        
        StylersService.updateProfile(req.auth.publicId, requestDetails)
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(500).send(err);
            });
    };

    this.GetStylersByServices = function (req, res, next) {
        StylersService.GetStylerByService(req.params.service, req.params.pagenumber, req.params.pagesize, JSON.parse(req.query.coordinates))
            .then(data => res.status(200).send(data))
            .catch(err => res.status(500).send(err));
    }

    this.GetStylersWithException = function (req, res, next) {
        StylersService.GetStylersWithException(req.params.service, req.params.styler, req.params.pagenumber, req.params.pagesize, JSON.parse(req.query.coordinates))
            .then(data => res.status(200).send(data))
            .catch(err => res.status(500).send(err));
    }

    // this.verifyStyler = (req, res) => {
    //     StylersService.verifyStyler(req.auth.role, req.query.id).then(data => {
    //         res.status(200).send(data)
    //     }).catch(err => res.status(500).send(err));
    // }

    this.verifyStyler = (req, res) => {
        StylersService.verifyStyler( req.query.id).then(data => {
            res.status(200).send(data)
        }).catch(err => res.status(500).send(err));
    }

    this.favouriteStylerService = function (req, res, next) {
        StylersService.FavouriteStyler(req.auth.publicId, req.params.id, req.body.service, JSON.parse(req.query.coordinates))
            .then(data => res.status(200).send(data))
            .catch(err => res.status(500).send(err));
    }

    this.StylerReview = function (req, res, next) {
        var data = { userId: req.auth.Id, message: req.body.review, CreatedAt: Date.now() }
        StylersService.reviewStyler(req.params.id, data)
            .then(data => res.status(200).send(data))
            .catch(err => res.status(500).send(err));
    }

    this.getStylerSummary = (req, res) => {
        StylersService.getStylerSummary(req.auth.Id).then(data => {
            res.json({ data });
        }).catch(err => {
            res.status(500).send(err);
        })
    }

    this.updateStylerLocation = (req, res) => {
        StylersService.updateStylerLocation(req.body.location, req.auth.Id)
            .then(data => res.json(data))
            .catch(err => res.status(500).send(err));
    }

    this.GetStylersServices = (req, res) => {
        StylersService.GetStylersServices(req.auth.Id)
            .then(data => res.json(data))
            .catch(err => res.status(500).send(err));
    }
}