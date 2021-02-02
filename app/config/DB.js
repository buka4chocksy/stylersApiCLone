var mongoose = require('mongoose');

//const uri = process.env.DB_URI;
const uri = process.env.NODE_ENV == 'prod' ? process.env.DB_PROD : process.env.DB_LOCAL;

module.exports = function init() {
    if (uri) {
        mongoose.connect(
            uri, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true
        },
            (err) => {
                if (err) {
                    console.log('Server not connected to databsase ', err)
                } else {

                    console.log("Connnection to MongoDb Successfull");
                }
            }
        )
    } else {
        throw new Error("DB URI not found, please kindly check your connection !!");
    }
}