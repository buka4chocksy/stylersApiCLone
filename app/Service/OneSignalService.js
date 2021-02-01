var OneSignal = require("onesignal-node");
const _user = require('../Model/user');
var ObjectId = require('mongoose').Types.ObjectId;
var APP_ID = process.env.ONE_SIGNAL_APP_ID;
var API_KEY = process.env.ONE_SIGNAL_API_KEY;
var USER_KEY = process.env.ONE_SIGNAL_USER_KEY;

var myClient = new OneSignal.Client({
    userAuthKey: USER_KEY,
    app: { appAuthKey: API_KEY, appId: APP_ID }
});

module.exports = {
    sendNotice(users, title, message, callback) {
        _user.find({
            '_id': {
                $in: users.map(e => ObjectId(e))
            }
        }, (err, docs) => {
            console.log('user one signal ID')
            console.log(docs.map(e => e.oneSignalUserId)[0])
            if (docs.length) {
                const notification = {
                    app_id: APP_ID,
                    headings: {
                        en: title,
                    },
                    contents: {
                        en: message
                    },
                    include_player_ids: docs.map(e => e.oneSignalUserId)[0]
                };
                myClient
                    .createNotification(notification)
                    .then(response => {
                        callback(null, response.body.id);
                    })
                    .catch(err => {
                        callback(err, null);
                    });
            }
        })
    }
};
