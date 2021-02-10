var model = require('../Model/contactUs');
var user = require('../Model/user');
var mailer = require('../Middleware/mailer');
var subscribers = require('../Model/subscribers')
const Excel = require('exceljs');
const xl = require('excel4node');
exports.createHelp = (data) => {
    return new Promise((resolve, reject) => {
        user.findById({ _id: data.userId }).then(found => {
            if (found) {
                mailer.Help(data.email, data.name, data.message, (err, data) => {
                    if (err) resolve({ success: false, message: err });
                    if (data) {
                        resolve({ success: true, message: 'Your help message was sent' })
                    } else {
                        reject({ success: false, message: 'Your help message was not sent' })
                    }
                })
            }
            reject({ success: false, message: 'Unauthorized' })
        }).catch(err => {
            resolve({ success: false, message: err });
        });
    })
}

exports.addSubscribers = async (data) => {
    try {
        let checkemail = await subscribers.findOne({ email: data.email })
        if (checkemail) {
            return { success: false, message: 'you already subscribed to our news letter' }
        } else {
              let result = {email:data.email}
              await  subscribers.create(result)
             await mailer.subscriberNoti(data.email )
            return { success: true, message: 'subscription was done successfully' }
        }
    } catch (err) {
        return err
    }
}

exports.deleteSubscriber = async (data) => {
    try {
        let deleted = await subscribers.findOneAndDelete({ email: data.email })
        if (deleted) {
            return { success: false, message: 'subscriber deleted' }
        } else {
            return { success: true, message: 'unable to delete subscriber ' }
        }
    } catch (err) {
        return err
    }
}
