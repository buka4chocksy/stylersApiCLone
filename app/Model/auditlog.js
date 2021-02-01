var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var auditlogSchema = new Schema({
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'user', autopopulate: true },
    description: { type: String, },
    IPAddress: { type: String, },
    createdAt: { type: Date },
})

auditlogSchema.index({ '$**': 'text', "name": 'text' });
auditlogSchema.plugin(require('mongoose-autopopulate'))

module.exports = mongoose.model('auditlogs', auditlogSchema);;