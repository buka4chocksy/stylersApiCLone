var service = require('../Service/contactUsService');
module.exports = function contactController() {
    this.createHelp = (req, res) => {
        var details = {
            email: req.body.email,
            // topic:req.body.topic,
            message: req.body.message,
            name: req.body.name,
            userId: req.auth.Id,
            CreatedAt: Date.now()
        }
        service.createHelp(details)
            .then(data => res.status(200).send(data))
            .catch(err => res.status(500).send(err));
    }
}

