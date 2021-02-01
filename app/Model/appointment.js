var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoosastic = require('mongoosastic')
const constants = require('../constants');
var AppointmentSchema = new Schema({
    userId: { type: mongoose.SchemaTypes.ObjectId, ref: 'user', autopopulate: true },
    stylerId: { type: mongoose.SchemaTypes.ObjectId, ref: 'stylers', autopopulate: true },
    services: [{
        subServiceId: { type: String, ref: 'subServices', autopopulate: true },
        adult: { type: Number },
        child: { type: Number }
    }],
    pickUp: {
        latitude: String,
        longitude: String,
        // streetName: String,
    },
    stylerLocation: {
        latitude: String,
        longitude: String,
    },
    paymentType: { type: String, enum: ['CARD', 'POINT'], },
    // accepted: Boolean,
    // completed: Boolean,
    seen: { type: Boolean, default: false, },
    status: { type: String, enum: [constants.BOOKED, constants.ACCEPTED, constants.STARTED, constants.COMPLETED, constants.CANCELLED] },
    dateSeen: { type: Date },
    streetName: { type: String },
    totalAmount: { type: Number },
    sumTotal: { type: Number },
    reasonToDecline: { type: String },
    scheduledDate: { type: Date, default: new Date() },
    expDate: { type: Date, },
    startServiceDate: { type: Date, default: new Date() },
    endServiceDate: { type: Date, default: new Date() },
    dateModified: { type: Date },
    // dateCompleted: { type: Date },
    CreatedAt: { type: Date, default: Date.now },
    transactionReference: { type: String, },
    // review: [{
    //     userId: { type: String, ref: 'user', autopopulate: true },
    //     message: { type: String },
    //     CreatedAt: { type: Date }
    // }],
    // ratings: [{
    //     rating: { type: Number },
    //     userId: { type: mongoose.SchemaTypes.ObjectId, ref: 'user', autopopulate: true },
    // }],
})

AppointmentSchema.plugin(mongoosastic)

module.exports = mongoose.model('appointment', AppointmentSchema); 