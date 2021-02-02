var model = require('../Model/appointment');
var BaseRepo = require('../Repository/BaseRepository');
var styler = require('../Model/stylers');
var service = require('../Model/services');
var auditlogs = require('../Model/auditlog');
var bookingFunction = require('../Middleware/bookingAlgo')
var stylersRepo = require('../Repository/BaseRepository');
var BookingRepo = new BaseRepo(model);
const request = require('request');
const user = require('../Model/user');
const notify = require('../Service/OneSignalService');
const constants = require('../constants');
var ip = require('ip');

exports.FindStyler = function (option, pagenumber = 1, pagesize = 20) {
    return new Promise((resolve, reject) => {
        service.find({ name: { $regex: option, $options: 'i' } })
            .exec((err, found) => {
                if (err) { reject(err); }
                if (found == null || Object.keys(found).length === 0) {
                    resolve({ success: false, data: {}, message: "We could not find what you are looking for." })
                } else {
                    var ids = found.map(docs => { return docs._id });
                    styler.find({ "services.serviceId": { $in: ids } })
                        .skip((parseInt(pagenumber - 1) * parseInt(pagesize))).limit(parseInt(pagesize))
                        .populate({ path: "services.serviceId", model: "services", select: { _id: 0, __v: 0 } })
                        .exec((err, stylers) => {
                            if (err) reject(err);
                            if (stylers) {
                                resolve({ success: true, message: 'stylers found', data: stylers })
                            } else {
                                resolve({ success: false, message: 'Unable to find what you searched for !!' })
                            }
                        });
                }
            })
    })
}

exports.BookService = (options) => {
    return new Promise(async (resolve, reject) => {
        var saveCard = options['saveCard'];
        if (saveCard) delete options['saveCard'];
        options.status = constants.BOOKED;
        options.expDate = new Date(options.scheduledDate).addHours(1);
        var _styler = await styler.findById(options.stylerId);
        var _stylerUser = await user.findOne({ publicId: _styler.publicId });
        BookingRepo.add(options).then(async created => {
            if (created) {
                if (options.initial) {
                    request(`https://api.paystack.co/transaction/verify/${options.transactionReference}`,
                        {
                            method: 'GET',
                            json: true,
                            headers: { Authorization: 'Bearer sk_test_affe46073a2b7bbb8619cceba17adc525e7be045' },
                        }, async (err, res, result) => {
                            if (result && result.data) {
                                if (saveCard) {
                                    user.update(
                                        { _id: options.userId },
                                        {
                                            $push: {
                                                cards: {
                                                    cardNumber: result.data.authorization.last4,
                                                    expMonth: result.data.authorization.exp_month,
                                                    expYear: result.data.authorization.exp_year,
                                                    authorizationCode: result.data.authorization.authorization_code,
                                                    bank: result.data.authorization.bank,
                                                    cardType: result.data.card_type,
                                                    email: result.data.customer.email,
                                                }
                                            }
                                        }
                                        , (err, updated) => {
                                            resolve({ success: true, message: 'Service booked successfully' })
                                        })
                                } else {
                                    resolve({ success: true, message: 'success', data: result.data, })
                                }
                                //update new balance
                                await updateNewBalance(options);
                                notify.sendNotice(
                                    [_stylerUser._id],
                                    "New Appointment",
                                    `You have a new appointment`,
                                    (err, result) => console.log("sending push notification..." + result || err));
                                return;
                            } else {
                                reject({ success: false, message: 'failed', data: result.message, })
                            }
                        });
                } else {
                    console.log('sending notification..........!!!!!!!!!!!!!!!!!!!==================')
                    console.log(options)
                     //update new balance
                    await updateNewBalance(options);
                    notify.sendNotice(
                        [_stylerUser._id],
                        "New Appointment",
                        `You have a new appointment`,
                        (err, result) => console.log("sending push notification..." + result || err));
                    resolve({ success: true, message: 'Service booked successfully', data: created, })
                }
            } else {
                resolve({ success: false, message: 'Could not complete your booking process' })
            }
        }).catch(err => {
            reject(err);
        })
    })
}

async function updateNewBalance(options) {
    const _user = await user.findById(options.userId);
    const newBal = _user.balance - options.sumTotal;
    const finalBal = newBal.toString().startsWith("-") ? 0 : parseInt(newBal.toString().replace("-", ""));
    console.log("======final balance", finalBal)
    var audit = new auditlogs({ 
        user: options.userId, 
        description: `Service was booked and wallet was debited with ${options.sumTotal}`,
        IPAddress: ip.address(),
    });
    await audit.save();
    await user.update({ _id: options.userId, }, { balance: finalBal, });
}

exports.getAllBookings = (pagenumber = 1, pagesize = 20, userId) => {
    return new Promise((resolve, reject) => {
        model.find({}).skip((parseInt(pagenumber - 1) * parseInt(pagesize))).limit(parseInt(pagesize))
            .sort('-CreatedAt')
            .populate({ path: "services.subServiceId", model: "subServices", select: { __v: 0 } })
            .populate({ path: "userId", model: "user", select: { _id: 0, __v: 0 } })
            .populate({ path: "stylerId", model: "stylers", select: { __v: 0 } })
            .exec((err, data) => {
                if (err) reject(err);
                if (data) {
                    resolve({ success: true, message: 'Bookings found', data: data })
                } else {
                    resolve({ success: false, message: 'Unable to find what you searched for !!' })
                }
            });
    })
}

exports.getUserBookings = (pagenumber = 1, pagesize = 20, userId) => {
    return new Promise((resolve, reject) => {
        model.find({ userId, }).skip((parseInt(pagenumber - 1) * parseInt(pagesize))).limit(parseInt(pagesize))
            .sort('-CreatedAt')
            .populate({ path: "services.subServiceId", model: "subServices", select: { __v: 0 } })
            .populate({ path: "userId", model: "user", select: { _id: 0, __v: 0 } })
            .populate({ path: "stylerId", model: "stylers", select: { __v: 0 } })
            .exec((err, data) => {
                if (err) reject(err);
                if (data) {
                    if (data.length > 0) {
                        data.sort(function (a, b) {
                            return b.CreatedAt - a.CreatedAt;
                        })
                    }
                    resolve({ success: true, message: 'Bookings found', data: data })
                } else {
                    resolve({ success: false, message: 'Unable to find what you searched for !!' })
                }
            });
    })
}

exports.getStylerRequests = (pagenumber = 1, pagesize = 10, stylerId) => {
    return new Promise(async (resolve, reject) => {
        var unread = await model.find({ stylerId, $and: [{ status: constants.BOOKED }, { seen: false, }] });
        model.find({ stylerId, $or: [{ status: constants.BOOKED },] })
            .sort('-CreatedAt')
            .skip((parseInt(pagenumber - 1) * parseInt(pagesize))).limit(parseInt(pagesize))
            .populate({ path: "services.subServiceId", model: "subServices", select: { __v: 0 } })
            .populate({ path: "userId", model: "user", select: { _id: 0, __v: 0 } })
            .populate({ path: "stylerId", model: "stylers", select: { __v: 0 } })

            .exec((err, data) => {
                if (err) reject(err);
                if (data) {
                    resolve({ success: true, message: 'Requests found', data, notSeen: unread.length, })
                } else {
                    resolve({ success: false, message: 'Unable to find what you searched for!!' })
                }
            });
    })
}

exports.getStylerAppointments = (pagenumber = 1, pagesize = 20, stylerId) => {
    return new Promise((resolve, reject) => {
        model.find({ stylerId, status: { $ne: constants.BOOKED, }, })
            .sort('-CreatedAt')
            .skip((parseInt(pagenumber - 1) * parseInt(pagesize))).limit(parseInt(pagesize))
            .populate({ path: "services.subServiceId", model: "subServices", select: { __v: 0 } })
            .populate({ path: "userId", model: "user", select: { _id: 0, __v: 0 } })
            .populate({ path: "stylerId", model: "stylers", select: { __v: 0 } })
            .exec((err, data) => {
                if (err) reject(err);
                if (data) {
                    resolve({ success: true, message: 'Appointments found', data: data, })
                } else {
                    resolve({ success: false, message: 'Unable to find what you searched for !!' })
                }
            });
    })
}

exports.updateAppointment = (id, options) => {
    return new Promise((resolve, reject) => {
        model.updateMany({ seen: false, $or: [{ userId: id }, { stylerId: id }], }, options).exec(async (err, data) => {
            if (err) return reject(err);
            return resolve({ success: true, message: 'Appointments updated' })
        });
    });
}

exports.updateAppointmentStatus = (appointmentId, status, reasonToDecline = null) => {
    return new Promise((resolve, reject) => {
        let title = status == constants.ACCEPTED ? 'Appointment Accepted' :
            status == constants.COMPLETED ? 'Appointment Completed' : status == constants.CANCELLED ? 'Appointment Cancelled' :
                status == constants.STARTED ? 'Appointment Started' : '';
        let body = status == constants.ACCEPTED ? 'Your appointment has been accepted by styler' :
            status == constants.COMPLETED ? 'Your appointment has been completed by styler' 
                : status == constants.CANCELLED ? 'Your appointment has been cancelled by styler' : status == constants.STARTED ? 'Styler is coming' : '';
        model.findByIdAndUpdate(appointmentId, { status, dateModified: Date.now(), reasonToDecline, }).exec(async (err, data) => {
            if (err) reject(err);
            if (data) {
                if (status == constants.COMPLETED) {
                    console.log("updatinnnnnngggggggggggggg")
                    var _styler = await styler.findById(data.stylerId);
                    var commission = 0.1;
                    var newTotal = data.sumTotal - (commission * data.sumTotal);

                    var audit = new auditlogs({ 
                        user: _styler.user, 
                        description: `Service was completed and wallet was credited with ${newTotal}`,
                        IPAddress: ip.address(),
                    });
                    await audit.save();
                    // totalAmount
                    var updated = await user.updateOne({ publicId: _styler.publicId }, { dateModified: new Date(), $inc: { balance: newTotal, clientServed: 1, } });
                }
                if (status == constants.CANCELLED) {
                    var appointment = await model.findById(appointmentId);
                    var updated = await user.updateOne({ _id: data.userId }, { dateModified: new Date(), $inc: { balance: appointment.sumTotal, } });
                }
                notify.sendNotice(
                    [data.userId],
                    title,
                    body,
                    (err, result) => console.log("sending push notification..." + result || err));
                return resolve({ success: true, message: 'Appointment updated' })
            } else {
                resolve({ success: false, message: 'Unable to update appointment!!' })
            }
        });
    })
}

// ratings: [{
//     rating: { type: Number },
//     userId: { type: mongoose.SchemaTypes.ObjectId, ref: 'user', autopopulate: true },
//     appointmentId: { type: String, ref: 'booking', autopopulate: true, },
//     CreatedAt: { type: Date, default: Date.now }
// }],
// review: [{
//     userId: { type: String, ref: 'user', autopopulate: true },
//     appointmentId: { type: String, ref: 'booking', autopopulate: true, },
//     message: { type: String },
//     CreatedAt: { type: Date, default: Date.now }
// }],

exports.addRating = (options, auth) => {
    return new Promise((resolve, reject) => {
        console.log(options)

        styler.updateOne(
            { user: options.userId },
            {
                $push: {
                    ratings: {
                        rating: options.rating,
                        userId: auth.Id,
                        appointmentId: options.appointmentId,
                    },
                    review: {
                        message: options.message,
                        userId: auth.Id,
                        appointmentId: options.appointmentId,
                    }
                }
            }
        ).exec((err, data) => {
            console.log(data)
            if (err) reject(err);
            if (data) {
                resolve({ success: true, message: 'Ratings added' })
            } else {
                resolve({ success: false, message: 'Unable to add ratings!!' })
            }
        });
    })
}
