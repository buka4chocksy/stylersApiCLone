var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var contactUsSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    userId: { type: mongoose.Types.ObjectId, ref: 'user', autopopulate: true },
    topic: { type: String},
    message: { type: String},
    CreatedAt: { type: Date },
})

module.exports = mongoose.model('contactUs', contactUsSchema);
