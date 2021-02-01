var ServicesauthController = require('../Controller/ServicesController');
var middleware = require('../Middleware/AuthMiddleware');
var multer = require('../Middleware/multer')
var router = require('express').Router();

module.exports = function () {
    const servicesauthCtrl = new ServicesauthController();
    router.get('/sub/:pagesize/:pagenumber', servicesauthCtrl.GetAllSubServices);
    router.get('/sub/:serviceId', servicesauthCtrl.GetSubServiceByServiceId)
    // router.get('/:serviceId/sub/:pagesize/:pagenumber', servicesauthCtrl.GetAllSubServices)
    router.post('/', multer.upload.single('image'), servicesauthCtrl.CreateService)
    router.post('/sub/:serviceId', servicesauthCtrl.CreateSubService)
    router.get('/search', servicesauthCtrl.SearchServices);
    router.get('/:id', servicesauthCtrl.GetServiceById)
    router.get('/:pagesize/:pagenumber', servicesauthCtrl.GetAllServices);
    router.delete('/:id', servicesauthCtrl.DeleteService)
    router.put('/:id', multer.upload.single('image'), servicesauthCtrl.UpdateService)

    return router;
}