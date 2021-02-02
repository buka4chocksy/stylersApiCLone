var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// var subServiceSchema = new Schema({
//     name: { type: String, required: true },
//     createdAt: { type: Date, default: Date.now },
// })

var servicesSchema = new Schema({
    name: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    imageID: { type: String, default: '' },
    gender: [],
    createdAt: { type: Date },
    // subServices: [subServiceSchema]
})

servicesSchema.index({ '$**': 'text', "name": 'text' });
servicesSchema.plugin(require('mongoose-autopopulate'))
// mongoose.model('subServices', subServiceSchema);
// var servicesModel = mongoose.model('services', servicesSchema);
module.exports = mongoose.model('services', servicesSchema);;