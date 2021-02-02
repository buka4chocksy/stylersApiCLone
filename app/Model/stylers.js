var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var stylersSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    user: { type: mongoose.Types.ObjectId, ref: 'user', autopopulate: true },
    publicId: { type: mongoose.Types.ObjectId },
    callingCode: { type: String },
    location: {
        type: {
            type: String,
            default: "Point"
        },
        coordinates: [Number],
        name: String,
    },
    description: { type: String },
    MIA: { type: Number },
    IsVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
    // password: { type: String, required: true },
    // passwordToken: { type: Number },
    // role: { type: String, default: 'styler' },
    services: [{
        // favorites: [{ type: String, ref: 'user', autopopulate: true }],
        serviceId: { type: String, ref: 'services', autopopulate: true },
        subServiceId: { type: String, ref: 'subServices', autopopulate: true },
        adult: { type: Number },
        child: { type: Number }
    }],
    ratings: [{
        rating: { type: Number },
        userId: { type: mongoose.SchemaTypes.ObjectId, ref: 'user', autopopulate: true },
        appointmentId: { type: String, ref: 'booking', autopopulate: true, },
        CreatedAt: { type: Date, default: Date.now }
    }],
    review: [{
        userId: { type: String, ref: 'user', autopopulate: true },
        appointmentId: { type: String, ref: 'booking', autopopulate: true, },
        message: { type: String },
        CreatedAt: { type: Date, default: Date.now }
    }],
    favorites: [{
        type: mongoose.SchemaTypes.ObjectId, ref: 'user', autopopulate: true,
    }],
    imageUrl: { type: String, default: '' },
    imageID: { type: String, default: '' },
    // oneSignalUserId: [],
    CreatedAt: { type: Date },
})

stylersSchema.index({ location: '2dsphere' });
module.exports = mongoose.model('stylers', stylersSchema);
