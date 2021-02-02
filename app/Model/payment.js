var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var paymentSchema = new Schema({
    amount: { type: Number, required: true },
    userId: { type: mongoose.SchemaTypes.ObjectId, ref: 'user', autopopulate: true },
    stylerId: { type: mongoose.SchemaTypes.ObjectId, ref: 'stylers', autopopulate: true },
    appointmentId: { type: mongoose.SchemaTypes.ObjectId, ref: 'booking', autopopulate: true },
    refNumber: { type: Number, required: true },
    CreatedAt: { type: Date }
})

module.exports = mongoose.model('payment', paymentSchema);