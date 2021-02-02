var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var subServiceSchema = new Schema({
    name: { type: String, required: true },
    serviceId: { type: String, required: true, },
    createdAt: { type: Date, default: Date.now },
})

subServiceSchema.index({ '$**': 'text', "name": 'text' });
subServiceSchema.plugin(require('mongoose-autopopulate'))
module.exports = mongoose.model('subServices', subServiceSchema);