var BaseRepository = require('../Repository/BaseRepository');
var Styler = require('../Model/stylers');
var client = require('../Model/user');
var mailer = require('../Middleware/mailer');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var appointment = require('../Model/appointment');
var user = require('../Model/user');
var service = require('../Model/services');
var Sms = require('../Middleware/mailer');
var subService = require('../Model/services').subServicesModel;
var UserRepo = new BaseRepository(user);
var StylerRepo = new BaseRepository(Styler);
var ClientRepo = new BaseRepository(client);
var ServiceRepo = new BaseRepository(service);
var secret = process.env.Secret;
var constants = require('../constants');

exports.RegisterUser = (Options) => {
    return new Promise((resolve, reject) => {
        let hash = bcrypt.hashSync(Options.password, 10);
        var b = {
            password: hash,
            CreatedAt: new Date(),
            passwordToken: 1111,
            role: 'styler',
            status: false,
        }

        var request = Object.assign(Options, b);
        client.findOne({ $or: [{ email: Options.email }, { phoneNumber: Options.phoneNumber }] }).then(exists => {
            if (exists) {
                reject({ success: false, message: 'Sorry, phone number or email already exists' });
            } else {
                ClientRepo.add(request).then(created => {
                    if (created) {
                        var u = Object.assign(Options, { user: created._id, publicId: created.publicId, CreatedAt: new Date() })
                        StylerRepo.add(u).then(styler => {
                            if (styler) {
                                getUserDetail(styler).then(userdetail => {
                                    generateToken(userdetail).then((token) => {
                                        resolve({ success: true, data: { user: userdetail, token: token }, message: 'Registration Successful' })
                                    }).catch((err) => {
                                        reject({ success: false, data: err, message: 'could not authenticate user' })
                                    })
                                })
                            } else {
                                resolve({ success: true, message: 'Error signing styler up ' });
                            }
                        })

                    } else {
                        resolve({ success: false, message: 'User SignUp was not successfull' });
                    }
                })
            }
        }).catch(err => {
            reject(err);
        })
    })
}

exports.StylerRegStatus = (Id) => {
    return new Promise((resolve, reject) => {
        Styler.findOne({ _id: Id }).then(async result => {
            var user = await client.findById(result.user);
            const isVerified = user.status;
            if (result && result.services.length) {
                resolve({ success: true, isVerified, message: 'Styler Service has been updated!' });
            } else {
                resolve({ success: false, isVerified, message: 'Styler Service has not been updated!' });
            }
        }).catch(err => {
            reject(err)
        })
    })
}

exports.forgotPasswordToken = data => {
    return new Promise((resolve, reject) => {
        client.findOne({ email: data.email })
            .then(found => {
                if (found) {
                    mailer.forgortPasswordMailer(data.email, data.passwordToken)
                            client.updateOne(
                                { email: found.email },
                                { passwordToken: data.passwordToken },
                                function (err, updated) {
                                    if (err) reject(err);
                                    if (updated) {
                                        resolve({
                                            success: true,
                                            message:
                                                "Please check your email for verification code "
                                        });
                                    } else {
                                        resolve({
                                            success: true,
                                            message: "Error sending verification code !!! "
                                        });
                                    }
                                }
                            );

                } else {
                    resolve({ success: false, message: "Could not find user" });
                }
            })
            .catch(err => {
                reject(err);
            });
    });
};

exports.changeforgotPassword = Options => {
    return new Promise((resolve, reject) => {
        client.findOne({ passwordToken: Options.passwordToken })
            .then(found => {
                if (found) {
                    let hash = bcrypt.hashSync(Options.password, 10);
                    client.updateOne({ email: found.email }, { password: hash })
                        .then(updated => {
                            if (updated) {
                                resolve({
                                    success: true,
                                    message: "User password updated Successfully !!!"
                                });
                            } else {
                                resolve({
                                    success: false,
                                    message: "Unable to update user password !!!"
                                });
                            }
                        })
                        .catch(err => {
                            reject(err);
                        });
                } else {
                    resolve({ success: false, message: "invalid token inserted " });
                }
            })
            .catch(err => {
                reject(err);
            });
    });
};


exports.changepassword = (data) => {

    return new Promise((resolve, reject) => {
        client.findOne({ email: data.email }).then(found => {
            if (found) {
                var IsValid = bcrypt.compareSync(data.originalPassword, found.password)
                if (IsValid == true) {
                    var newpassword = data.password
                    var hashNewPassword = bcrypt.hashSync(newpassword, 10)
                    client.updateOne({ email: data.email }, { password: hashNewPassword }).then(updated => {
                        if (updated) {
                            resolve({ success: true, message: 'password has been changed successfully !!' })
                        } else {
                            resolve({ success: false, message: 'Error encountered while updating password ' })
                        }
                    }).catch(err => {
                        reject(err);
                    })
                }
            }
        }).catch(err => {
            reject(err);
        })
    })
}


exports.AddServicePrice = (id, Option) => {
    return new Promise((resolve, reject) => {
        Styler.findOne({ publicId: id, "services.serviceId": Option.serviceId }, { 'services.$': 1 }).then(found => {
            if (!found) {
                Styler.findOneAndUpdate({ publicId: id }, { $push: { services: Option } }).exec((err, data) => {
                    if (err) {
                        reject({ success: false, message: err });
                    } else if (data) {
                        resolve({ success: true, message: 'Service price added successfully' })
                    } else {
                        resolve({ success: false, message: 'Could not add service price' })
                    }
                })
            } else {
                resolve({ success: false, message: 'Detail inserted already exists !!!' })
            }
        }).catch(err => {
            reject(err)
        })

    })
}


exports.FavouriteStyler = (userid, stylerId) => {
    return new Promise((resolve, reject) => {
        Styler.findOne({ publicId: stylerId, favorites: userid }).then(found => {
            if (!found) {
                Styler.findOneAndUpdate({ publicId: stylerId }, { $push: { 'favorites': userid } }).exec((err, data) => {
                    if (err) {
                        reject({ success: false, message: err });
                    } else if (data) {
                        Styler.findOne({ publicId: stylerId }).then(data => {
                            resolve({ success: true, message: 'Styler added as favourite', data: data.favorites.length })
                        })

                    } else {
                        resolve({ success: false, message: 'Service not available on styler list ' });
                    }
                })
            } else {
                Styler.findOne({ publicId: stylerId }).then(data => {
                    resolve({ success: true, message: 'Sorry you already added this styler as your favourite', data: data.favorites.length })
                })
            }
        }).catch(err => {
            reject(err);
        })
    })
}

exports.reviewStyler = (stylerId, Option) => {
    return new Promise((resolve, reject) => {
        Styler.findOneAndUpdate({ publicId: stylerId }, { $push: { review: Option } }).exec((err, updated) => {
            if (err) {
                reject({ success: false, message: err });
            } else if (updated) {
                resolve({ success: true, message: 'Styler review made successfully' })
            } else {
                resolve({ success: false, message: 'Could review styler !!' })
            }
        })
    })
}

exports.UpdateServicePrice = function (id, data) {
    return new Promise((resolve, reject) => {
        StylerRepo.updateById(id, {
            $set: {
                'services': data
            }
        }).then(updated => {
            console.log(updated)
            if (updated) {
                resolve({ success: true, message: 'stylers service updated successfully', data: updated })
            } else {
                resolve({ success: true, message: 'unable to update styler service ', data: updated })
            }
        }).catch(err => {
            reject({ success: false, data: err, message: "could not update styler service" });
        });
    })
}

exports.getStylers = (pagenumber = 1, pagesize = 20) => {
    return new Promise((resolve, reject) => {
        Styler.find({}).skip((parseInt(pagenumber - 1) * parseInt(pagesize))).limit(parseInt(pagesize))
            .populate({ path: "services.serviceId", model: "services", select: { _id: 0, __v: 0 } })
            .populate({ path: "services.subServiceId", })
            .populate({ path: "user", model: "user", select: { __v: 0 } })
            .populate({ path: "review.userId", model: "user", select: { _id: 0, __v: 0, password: 0, publicId: 0, statusCode: 0, status: 0, CreatedAt: 0 } })
            .exec((err, stylers) => {
                if (err) reject(err);
                if (stylers) {
                    resolve({ success: true, message: 'stylers found', data: stylers })
                } else {
                    resolve({ success: false, message: 'Unable to find what you searched for !!' })
                }
            });
    });
}


exports.getStylerDetails = (stylerId) => {
    return new Promise((resolve, reject) => {
        Styler.findById({ _id: stylerId })
            .populate({ path: "services.serviceId", model: "services", select: { _id: 0, __v: 0 } })
            .populate({ path: "user", model: "user", select: { _id: 0, __v: 0 } })
            .populate({ path: "review.userId", model: "user", select: { _id: 0, __v: 0, password: 0, publicId: 0, statusCode: 0, status: 0, CreatedAt: 0 } })
            .exec((err, stylers) => {
                if (err) reject(err);
                if (stylers) {

                    resolve({ success: true, message: 'styler found', data: stylers })
                } else {
                    resolve({ success: false, message: 'Unable to find what you searched for !!' })
                }
            });
    });
}

exports.getStylerById = (stylerId) => {
    return new Promise((resolve, reject) => {
        Styler.findById({ _id: stylerId })
            .populate({ path: "services.serviceId", model: "services", select: { _id: 0, __v: 0 } })
            .populate({ path: "user", model: "user", select: { _id: 0, __v: 0 } })
            .populate({ path: "review.userId", model: "user", select: { _id: 0, __v: 0, password: 0, publicId: 0, statusCode: 0, status: 0, CreatedAt: 0 } })
            .exec((err, stylers) => {
                if (err) reject(err);
                if (stylers) {

                    resolve({ success: true, message: 'styler found', data: stylers })
                } else {
                    resolve({ success: false, message: 'Unable to find what you searched for !!' })
                }
            });
    });
}

exports.sortStylers = () => {
    return new Promise((resolve, reject) => {
        Styler.find()
            .populate({ path: "services.serviceId", model: "services", select: { _id: 0, __v: 0 } })
            .populate({ path: "user", model: "user", select: { _id: 0, __v: 0 } })
            .populate({ path: "review.userId", model: "user", select: { _id: 0, __v: 0, password: 0, publicId: 0, statusCode: 0, status: 0, CreatedAt: 0 } })
            .exec((err, found) => {
                if (err) reject(err);
                if (found) {
                    var maps = found.sort(function (a, b) {
                        return b.favorites.length - a.favorites.length;

                    })
                    resolve({ success: true, message: 'stylers found', data: maps })

                } else {
                    resolve({ success: false, message: 'Could  not find data' })
                }
            })
    })
}

exports.sortStylersByPrice = (serviceId, coordinates) => {
    return new Promise((resolve, reject) => {
        console.log(coordinates)
        Styler.find({
            'services.serviceId': serviceId,
            location: filterParams(coordinates),
        })
            .populate({ path: "services.serviceId", model: "services", select: { _id: 0, __v: 0 } })
            .populate({ path: "user", model: "user", select: { _id: 0, __v: 0 } })
            .populate({ path: "review.userId", model: "user", select: { _id: 0, __v: 0, password: 0, publicId: 0, statusCode: 0, status: 0, CreatedAt: 0 } })
            .sort({ startingPrice: 1 })
            .exec((err, found) => {
                if (err) reject(err);
                if (found.length) {
                    resolve({ success: true, count: found.length, message: 'stylers found', data: found })
                } else {
                    resolve({ success: false, message: 'Could  not find data' })
                }
            })
    })
}

exports.sortStylersByRating = (serviceId, coordinates) => {
    return new Promise((resolve, reject) => {
        Styler.find({
            'services.serviceId': serviceId,
            location: filterParams(coordinates),
        })
            .populate({ path: "services.serviceId", model: "services", select: { _id: 0, __v: 0 } })
            .populate({ path: "user", model: "user", select: { _id: 0, __v: 0 } })
            .populate({ path: "review.userId", model: "user", select: { _id: 0, __v: 0, password: 0, publicId: 0, statusCode: 0, status: 0, CreatedAt: 0 } })
            .sort({ "ratings.rating": -1 })
            .exec((err, found) => {
                if (err) reject(err);
                if (found.length) {
                    resolve({ success: true, count: found.length, message: 'stylers found', data: found })
                } else {
                    resolve({ success: false, message: 'Could  not find data' })
                }
            })
    })
}

exports.verifyStyler = (id ) => {
    return new Promise(async (resolve, reject) => {
        var user = await client.findById(id);
        var newStatus = !user.status;

        client.findByIdAndUpdate({ _id: id }, { status: newStatus }).exec((err, updated) => {
            if (updated) {
                mailer.verificationMail(updated.email)
                resolve({ success: true, message: 'user verified successfully' })

            } else if (!updated) {
                resolve({ success: false, message: 'Error verifying styler ' })
            } else {
                reject(err)
            }
        })
    })
}

exports.updateAvatar = function (id, data) {
    return new Promise((resolve, reject) => {
        user.update({ publicId: id }, data).then(updated => {
            if (updated) {
                StylerRepo.getById(updated._id)
                    .then(user => resolve({ success: true, data: user, message: "your avatar was updated successfully" }))
                    .catch(err => resolve({ success: false, data: err, message: "unable to update user avatar" }))
            }
        }).catch(err => {
            reject({ success: false, data: err, message: "could not update avatar" });
        });
    })
}

exports.updateProfile = function (id, data) {
    return new Promise((resolve, reject) => {
        UserRepo.updateByQuery({ publicId: id }, data).then(updated => {
            if (updated) {
                StylerRepo.updateByQuery({ publicId: id }, data).then(styler => {
                    if (styler) {
                        StylerRepo.getById(styler._id)
                            .then(user => resolve({ success: true, data: styler, message: "your profile was updated successfully" }))
                            .catch(err => resolve({ success: false, data: err, message: "unable to update user Profile" }))
                    }
                }).catch(err => {
                    reject({ success: false, data: err, message: "could not update profile" });
                });
            }
        });
    })
}

function getUserDetail(styler) {
    return new Promise((resolve, reject) => {
        if (styler) {
            return resolve({ email: styler.email, name: styler.name, phone: styler.phoneNumber, publicId: styler.publicId, role: 'styler', isActive: false, });
        }
        return reject(undefined);
    });
}

function generateToken(data = {}) {
    return new Promise((resolve, reject) => {
        jwt.sign({ ...data }, secret, { expiresIn: '24hrs' }, function (err, token) {
            if (err) {
                reject(err);
            } else {
                resolve(token);
            }
        });
    })
}

exports.generateToken = generateToken;

function verifyToken(token = "") {
    return new Promise((resolve, reject) => {
        jwt.verify(token.replace("Bearer", ""), secret, function (err, decodedToken) {
            if (err) {
                reject(err);
            } else {
                resolve(decodedToken);
            }
        });
    });
};
exports.verifyToken = verifyToken;


exports.GetStylerByService = (serviceId, pagenumber = 1, pagesize = 10, coordinates) => {
    return new Promise((resolve, reject) => {
        Styler.find(
            {
                "services.serviceId": { $in: serviceId },
                location: filterParams(coordinates),
            }
        )
            .skip((parseInt(pagenumber - 1) * parseInt(pagesize))).limit(parseInt(pagesize))
            .populate({ path: "user", model: "user", select: { __v: 0 } })
            .populate({ path: "services.serviceId", model: "services", select: { __v: 0 } })
            .populate({ path: "services.subServiceId", model: "subServices", select: { __v: 0 } })
            .populate({ path: "review.userId", model: "user", select: { name: 1 } })
            .exec((err, stylers) => {
                if (err) reject(err);
                if (stylers) {
                    if (stylers.length == 0) return resolve({ success: true, message: 'Oops! Sorry, no stylers found within your region', data: stylers })
                    return resolve({ success: true, message: 'stylers found', data: stylers })
                } else {
                    return resolve({ success: false, message: 'Unable to find what you searched for !!' })
                }
            });
    })
}

exports.GetStylersWithException = (serviceId, styler, pagenumber = 1, pagesize = 10, coordinates) => {
    return new Promise((resolve, reject) => {
        ServiceRepo.getById(serviceId).then(service => {
            Styler.find(
                {
                    _id: { $ne: styler, },
                    "services.serviceId": { $in: serviceId },
                    location: filterParams(coordinates),
                }
            )
                .skip((parseInt(pagenumber - 1) * parseInt(pagesize))).limit(parseInt(pagesize))
                .populate({ path: "user", model: "user", select: { __v: 0 } })
                .populate({ path: "services.serviceId", model: "services", select: { __v: 0 } })
                .populate({ path: "services.subServiceId", model: "subServices", select: { __v: 0 } })
                .populate({ path: "review.userId", model: "user", select: { name: 1 } })
                .exec((err, stylers) => {
                    if (err) reject(err);
                    if (stylers) {
                        if (stylers.length == 0) return resolve({ success: true, message: 'Oops! Sorry, no stylers found within your region', data: { stylers, service, } })
                        return resolve({ success: true, message: 'stylers found', data: { stylers, service, } })
                    } else {
                        return resolve({ success: false, message: 'Unable to find what you searched for !!' })
                    }
                });
        })
    })
}

exports.GetStylerByFavorite = (serviceId, pagenumber = 1, pagesize = 20, coordinates) => {
    return new Promise((resolve, reject) => {
        Styler.find({
            "services.serviceId": { $in: serviceId },
            location: filterParams(coordinates),
        })
            .skip((parseInt(pagenumber - 1) * parseInt(pagesize))).limit(parseInt(pagesize))
            .populate({ path: "services.serviceId", model: "services", select: { _id: 0, __v: 0 } })
            .exec((err, stylers) => {
                if (err) reject(err);
                if (stylers) {
                    resolve({ success: true, message: 'stylers found', data: stylers })
                } else {
                    resolve({ success: false, message: 'Unable to find what you searched for !!' })
                }
            });
    })
}

// exports.getStylerTotalAmount = (data) => {
//     return new Promise((resolve, reject) => {
//         appointment.find({ $and: [{ stylerId: data }, { status: constants.COMPLETED },] }).then(found => {
//             if (found) {
//                 appointment.find({ $and: [{ stylerId: data }, { status: constants.COMPLETED },] }).count((err, total) => {
//                     if (err) reject(err)
//                     Styler.findById(data, (err, styler) => {
//                         var rating = styler.ratings.reduce((p, c) => p + c.rating, 0) / styler.ratings.length;
//                         var a = found.map(b => b.totalAmount)
//                         let sumTotal = a.reduce((c, d) => c + d, 0)
//                         resolve({ success: true, message: 'total amount', totalAmount: sumTotal, clients: total, rating: rating || 0, })
//                     })
//                 })
//             } else {
//                 resolve({ success: false, message: ' Styler sum total not found !!!' })
//             }

//         }).catch(err => {
//             reject(err);
//         })
//     })
// }

exports.getStylerSummary = (Id) => {
    return new Promise((resolve, reject) => {
        Styler.findById(Id, async (err, styler) => {
            const _user = await user.findOne({ publicId: styler.publicId });
            var rating = styler.ratings.reduce((p, c) => p + c.rating, 0) / styler.ratings.length;
            return resolve({
                success: true,
                message: 'styler summary',
                totalAmount: _user.balance || 0,
                clients: _user.clientServed || 0,
                rating: rating || 0,
            })
        })
    })
}

exports.updateStylerLocation = (location, Id) => {
    return new Promise((resolve, reject) => {
        appointment.updateByQuery({ _id: Id }, { stylerLocation: location }).then(result => {
            if (result) {
                resolve({ success: true, message: 'styler current location', })
            } else {
                resolve({ success: false, message: ' Styler sum total not found !!!' })
            }

        }).catch(err => {
            reject(err);
        })
    })
}

exports.GetStylersServices = (Id) => {
    return new Promise((resolve, reject) => {
        Styler.findOne({ _id: Id })
            // .populate({ path: "services.serviceId", model: "services", select: { _id: 0, __v: 0 } })
            // .populate({ path: "services.subServiceId", model: "services", select: { _id: 0, __v: 0 } })
            // .populate({ path: "services.subServiceId", model: "services" })
            .then(result => {
                if (result) {
                    resolve({ success: true, message: 'styler services', data: result.services, })
                } else {
                    resolve({ success: false, message: 'Error while fetching styler service' })
                }

            }).catch(err => {
                reject(err);
            })
    })
}

function filterParams(coordinates) {
    return {
        $near: {
            $geometry: {
                type: 'Point',
                coordinates,
            },
            $maxDistance: 1500,
            // $maxDistance: 150000000,
            $minDistance: 0,
        }
    }
}