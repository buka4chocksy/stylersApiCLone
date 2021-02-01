var booking = require('../Model/appointment');
const user = require('../Model/user');
var sockets = {};
var connectedUsers = {};

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

sockets.init = function (server) {
    // socket.io setup
    var io = require('socket.io').listen(server);

    io.sockets.on('connection', function (socket) {
        //add user to socket
        socket.on('auth', function (user) {
            console.log('authenticating...', user)
            // io.emit('noOfConnections', Object.keys(io.sockets.connected).length);
            connectedUsers[socket.id] = user;
            socket.join(user);
        })

        // socket.on('online', function () {
        //     io.sockets.emit('online', Object.values(connectedUsers));
        // })

        socket.on('disconnect', function (err) {
            var e = connectedUsers[socket.id];
            const socketID = e;
            if (e) {
                socket.leave(e);
                delete e;
            }
            console.log("user just got disconnected", socketID);
        });

        socket.on('logout', function (user) {
            //remove user
        })

        socket.on('notification', function (participants) {
            io.sockets.in('roomId').emit('notification', 'something');
        });

        socket.on('stylerLocation', function (location, credentials) {
            booking.findByIdAndUpdate(credentials.Id, { stylerLocation: location }).then(result => {
                io.sockets.in(credentials.userKey).emit('stylerLocation.send', location);
            })
        })

        socket.on('appointmentBooked', function (userKey) {
            io.sockets.in(userKey).emit('appointmentBooked.send');
        })

        socket.on('accept.appointment', function (userKey) {
            io.sockets.in(userKey).emit('appointment.accepted');
        })

        socket.on('start.appointment', function (userKey) {
            io.sockets.in(userKey).emit('appointment.started');
        })

        socket.on('serviceCompleted', function (userKey) {
            const socketID = getKeyByValue(connectedUsers, userKey);
            console.log("revvvvviiiiiiiieeeewwww", socketID);
            // io.sockets[socketID].emit('review.sent');
            io.sockets.in(userKey).emit('review.sent');
        })

        socket.on('removeOneSignalID', function (credentials) {
            var _user = require('../Model/user');
            _user.updateOne({ publicId: credentials.publicId }, { $pull: { oneSignalUserId: { $in: [credentials.oneSignalUserId] } } }).then(updated => {
                console.log(updated)
                if (updated) {
                    console.log("one signal ID removed successfully");
                }
                console.log("unable to remove one signal ID");
            });
        })
    });

}

module.exports = sockets;