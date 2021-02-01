var service = require('../Service/paymentService');
module.exports = function paymentController() {

    this.create = (req, res) => {
        service.CreatePayment(Object.assign(req.body, { userId: req.auth.Id })).then(data => {
            res.json({ data });
        }).catch(err => {
            res.status(500).send(err);
        })
    }

    this.initTransaction = (req, res) => {
        service.InitializeTransaction(req.body, req.auth)
            .then(data => res.status(200).send(data))
            .catch(err => res.status(500).send(err));
    }

    this.verifyTransaction = (req, res) => {
        service.VerifyTransaction(req.body, req.auth.Id)
            .then(data => res.status(200).send(data))
            .catch(err => res.status(500).send(err));
    }

    this.ChargeAuthorization = (req, res) => {
        service.ChargeAuthorization(req.body, req.auth)
            .then(data => res.status(200).send(data))
            .catch(err => res.status(500).send(err));
    }
}