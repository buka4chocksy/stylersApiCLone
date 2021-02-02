var CronJob = require('cron').CronJob;
var appointment = require('../Model/appointment');
var user = require('../Model/user');
var styler = require('../Model/stylers');
var constants = require('../constants');

var collection = {
    expireAppointments: function () {
        var job = new CronJob('* * * * *', async function () {
            return await appointment.find({ expDate: { "$lt": new Date() }, $or: [{ status: constants.BOOKED }, { status: constants.ACCEPTED }], }, async (err, appointments) => {
                if (appointments.length > 0) {
                    await appointments.map(async e => {
                        await user.updateOne({ _id: e.userId }, { balance: e.totalAmount }, async (err, userUpdated) => { });
                        await styler.updateOne({ _id: e.stylerId }, { $inc: { MIA: 1 }, }, async (err, stylerUpdated) => { })
                    })
                    await appointment.updateMany({ expDate: { "$lt": new Date() }, $or: [{ status: constants.BOOKED }, { status: constants.ACCEPTED }], },
                        { $set: { status: constants.EXPIRED } }, (err, result) => {
                            if (result && result.n > 0) {
                                console.log(result.n + " appointment(s) have expired");
                                return;
                            }
                            console.log("no appointment(s) have expired");
                        });
                }
            })
        })
        job.start();
    },
    // appointmentReminder: function () {
    //     var job = new CronJob('* * * * *', async function () {
    //         return await appointment.find({ expDate: { "$lt": new Date() }, status: constants.ACCEPTED }, async (err, appointments) => {
    //             if (appointments.length > 0) {
    //                 await appointments.map(async e => {
    //                     await user.updateOne({ _id: e.userId }, { balance: e.totalAmount }, async (err, userUpdated) => { });
    //                     await styler.updateOne({ _id: e.stylerId }, { $inc: { MIA: 1 }, }, async (err, stylerUpdated) => { })
    //                 })
    //                 await appointment.updateMany({ expDate: { "$lt": new Date() }, $or: [{ status: constants.BOOKED }, { status: constants.ACCEPTED }], },
    //                     { $set: { status: constants.EXPIRED } }, (err, result) => {
    //                         if (result && result.n > 0) {
    //                             console.log(result.n + " appointment(s) have expired");
    //                             return;
    //                         }
    //                         console.log("no appointment(s) have expired");
    //                     });
    //             }
    //         })
    //     })
    //     job.start();
    // }
}

module.exports = {
    init: function () {
        return (
            collection.expireAppointments()
        )
    }
}
