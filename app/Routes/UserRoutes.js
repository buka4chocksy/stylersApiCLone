var authController = require('../Controller/UserController');
var middleware = require('../Middleware/AuthMiddleware');
var multer = require('../Middleware/multer')
var router = require('express').Router();
var _base64ToFile = require('../Service/UtilityService').base64ToFile;
var _cloudinaryHelper = require('../Service/UtilityService').cloudinaryHelper;
var _config = require('../config');

module.exports = function(){
    const authCtrl = new authController();
    router.post('/register', authCtrl.register);
    router.post('/admin', authCtrl.adminLogin);
    router.post('/token/resend', authCtrl.resendToken);
    router.post('/authenticate', authCtrl.authenticate);
    router.put('/forgotPasswordToken', authCtrl.passwordToken);
    router.post('/forgotPassword', authCtrl.changeforgotPassword);
    router.get('/:pagesize/:pagenumber', authCtrl.getUsers);
    router.post('/changePassword',middleware.authenticate, authCtrl.changePassword);
    router.post('/verify', authCtrl.VerifyUser);
    router.post('/verify/social', authCtrl.VerifySocial);
    router.post('/verify/token', authCtrl.VerifyToken);
    // router.put('/update', middleware.authenticate , multer.upload.single('image') , authCtrl.updateClientProfile);
    router.put('/update', middleware.authenticate, _base64ToFile("image", _cloudinaryHelper({}, _config.cloudinary)), authCtrl.updateClientProfile)
    router.put('/update/onesignal', middleware.authenticate, authCtrl.updateOneSignalId)
    router.put('/remove/onesignal', middleware.authenticate, authCtrl.removeOneSignalId)
    router.get('/cards', middleware.authenticate, authCtrl.fetchCards);
    router.get('/balance', middleware.authenticate, authCtrl.getBalance);
    router.get('/:id', middleware.authenticate, authCtrl.getUserData);
    router.delete('/card/remove', middleware.authenticate, authCtrl.removeCard);

    return router;
}