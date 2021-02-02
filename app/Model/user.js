var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    publicId: { type: mongoose.Types.ObjectId },
    statusCode: { type: Number },
    gender: { type: String },
    callingCode: { type: String },
    countryCode: { type: String },
    balance: { type: Number, default: 0, },
    clientServed: { type: Number, default: 0, },
    cards: [{
        cardNumber: String,
        expMonth: String,
        expYear: String,
        authorizationCode: String,
        bank: String,
        cardType: String,
        email: String,
    }],
    passwordToken: { type: Number },
    password: { type: String, required: true },
    status: { type: Boolean },
    imageUrl: { type: String, default: '' },
    imageID: { type: String, default: '' },
    role: { type: String, required: true, default: 'user' },
    socialId: { type: String, },
    type: { type: String, default: 'default' },
    oneSignalUserId: [],
    userId: { type: String, },
    CreatedAt: { type: Date },
    dateModified: { type: Date },
})

module.exports = mongoose.model('user', userSchema);