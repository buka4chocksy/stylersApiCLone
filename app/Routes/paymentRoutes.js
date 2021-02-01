var paymentController = require('../Controller/paymentController');
var middleware = require('../Middleware/AuthMiddleware');
var router = require('express').Router();
module.exports = function(){
    const payCtrl = new paymentController();
    router.post('/', middleware.authenticate , payCtrl.create);
    router.post('/init', middleware.authenticate , payCtrl.initTransaction);
    router.post('/transaction/complete', middleware.authenticate , payCtrl.verifyTransaction);
    router.post('/authorization/charge', middleware.authenticate , payCtrl.ChargeAuthorization);

    return router;
}