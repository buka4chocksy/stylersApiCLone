var StylersauthController = require('../Controller/StylersController');
var middleware = require('../Middleware/AuthMiddleware');
var multer = require('../Middleware/multer')
var router = require('express').Router();
var _base64ToFile = require('../Service/UtilityService').base64ToFile;
var _cloudinaryHelper = require('../Service/UtilityService').cloudinaryHelper;
var _config = require('../config');

module.exports = function () {
    const StylerauthCtrl = new StylersauthController();
    router.post('/register', StylerauthCtrl.register);
    router.get('/register/status', middleware.StylerAuthenticate, StylerauthCtrl.stylerRegStatus);
    router.get('/getStylerDetails', middleware.StylerAuthenticate, StylerauthCtrl.GetStylerDetails);
    router.post('/authenticate', StylerauthCtrl.authenticate);
    router.put('/passwordToken', StylerauthCtrl.passwordToken);
    router.post('/changeForgotPassword', StylerauthCtrl.changeforgotPassword);
    router.post('/changepassword', middleware.StylerAuthenticate, StylerauthCtrl.changePassword);
    router.get('/sort/price/:id', StylerauthCtrl.SortStylersByPrice);
    router.get('/sort/rating/:id', StylerauthCtrl.SortStylersByRating);
    router.get('/:pagesize/:pagenumber', StylerauthCtrl.GetStylers);
    router.get('/styler/:id', StylerauthCtrl.GetStyler);
    router.get('/sort/', StylerauthCtrl.SortStylers);
    router.post('/favourite/:id', middleware.StylerAuthenticate, StylerauthCtrl.favouriteStylerService);
    router.get('/:service/:pagesize/:pagenumber', StylerauthCtrl.GetStylersByServices);
    router.get('/:service/exception/:styler/:pagesize/:pagenumber', StylerauthCtrl.GetStylersWithException);
    router.get('/services', middleware.StylerAuthenticate, StylerauthCtrl.GetStylersServices);
    router.get('/stats', middleware.StylerAuthenticate, StylerauthCtrl.getStylerSummary);
    router.post('/review/:id', middleware.StylerAuthenticate, StylerauthCtrl.StylerReview);
    router.put('/update/avatar', middleware.StylerAuthenticate, _base64ToFile("image", _cloudinaryHelper({}, _config.cloudinary)), StylerauthCtrl.updateClientAvatar)
    router.put('/update', middleware.StylerAuthenticate, _base64ToFile("image", _cloudinaryHelper({}, _config.cloudinary)), StylerauthCtrl.updateClientProfile)
    router.put('/update/services', middleware.StylerAuthenticate, StylerauthCtrl.UpdateServices)
    router.post('/verify', StylerauthCtrl.verifyStyler);

    return router;
}