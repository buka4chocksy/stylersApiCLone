var contactController = require('../Controller/contactController');
var middleware = require('../Middleware/AuthMiddleware');
var router = require('express').Router();

module.exports = function () {
    const contactCtrl = new contactController();
    router.post('/', middleware.authenticate, contactCtrl.createHelp);
    router.post('/subscribe',  contactCtrl.subscribers);
    router.delete('/delete',  contactCtrl.deleteSubscriber);

    return router;
}