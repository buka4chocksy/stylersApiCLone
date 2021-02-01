var BookingService = require('../Service/appointmentService');
module.exports = function ServicesController() {

    this.SearchServices = (req, res) => {
        var option = req.query.service;
        BookingService.FindStyler(option).then((data) => {
            res.json({ data });
        }).catch((err) => {
            res.status(500).send(err);
        });
    }

    this.CreateBooking = (req, res) => {
        BookingService.BookService(Object.assign(req.body, { userId: req.auth.Id })).then((data) => {
            res.json({ data });
        }).catch((err) => {
            res.status(500).send(err);
        });
    }

    this.AllBookings = function (req, res, next) {
        BookingService.getAllBookings(req.params.pagenumber, req.params.pagesize)
            .then(data => res.status(200).send(data))
            .catch(err => res.status(500).send(err));
    }

    this.UserBookings = function (req, res, next) {
        BookingService.getUserBookings(req.params.pagenumber, req.params.pagesize, req.auth.Id)
            .then(data => res.status(200).send(data))
            .catch(err => res.status(500).send(err));
    }

    this.StylerRequests = function (req, res, next) {
        BookingService.getStylerRequests(req.params.pagenumber, req.params.pagesize, req.auth.Id)
            .then(data => res.status(200).send(data))
            .catch(err => res.status(500).send(err));
    }

    this.StylerAppointments = function (req, res, next) {
        BookingService.getStylerAppointments(req.params.pagenumber, req.params.pagesize, req.auth.Id)
            .then(data => res.status(200).send(data))
            .catch(err => res.status(500).send(err));
    }

    // this.acceptAppointment = function (req, res, next) {
    //     BookingService.acceptAppointment(req.body.appointmentId)
    //         .then(data => res.status(200).send(data))
    //         .catch(err => res.status(500).send(err));
    // }

    // this.completeAppointment = function (req, res, next) {
    //     BookingService.completeAppointment(req.body.appointmentId)
    //         .then(data => res.status(200).send(data))
    //         .catch(err => res.status(500).send(err));
    // }

    this.updateAppointment = function (req, res, next) {
        BookingService.updateAppointment(req.auth.styler, req.body)
            .then(data => res.status(200).send(data))
            .catch(err => res.status(500).send(err));
    }

    this.updateAppointmentStatus = function (req, res, next) {
        const {
            appointmentId,
            reason,
        } = req.body;
        BookingService.updateAppointmentStatus(appointmentId, req.params.status, reason)
            .then(data => res.status(200).send(data))
            .catch(err => res.status(500).send(err));
    }

    this.addRating = function (req, res, next) {
        BookingService.addRating(req.body, req.auth)
            .then(data => res.status(200).send(data))
            .catch(err => res.status(500).send(err));
    }
}