var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var subscribersSchema = new Schema({
    email: { type:String},
    createdAt: { type: Date },
})
module.exports = mongoose.model('subscribers', subscribersSchema);;