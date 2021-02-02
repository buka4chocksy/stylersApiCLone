var services = require('../Model/services');
var BaseRepository = require('../Repository/BaseRepository');
var subService = require('../Model/subService');
var ServiceRepo = new BaseRepository(services);
var SubServiceRepo = new BaseRepository(subService);

exports.CreateService = (Options) => {
    return new Promise((resolve, reject) => {
        services.findOne({ name: Options.name }).then(found => {
            if (found) {
                resolve({ success: false, message: 'Sorry service already exists !!!' })
            } else {
                ServiceRepo.add(Options).then(created => {
                    if (created) {
                        resolve({ success: true, message: 'Service has been created successfully !!!' })
                    } else {
                        resolve({ success: false, message: 'Error Enocuntered while creating service..' })
                    }
                })
            }
        }).catch(err => {
            reject(err);
        })
    })
}

exports.CreateSubService = (Options, Id) => {
    return new Promise((resolve, reject) => {
        subService.findOne({ name: Options.name }).then(found => {
            if (found) {
                resolve({ success: false, message: 'Sorry sub service already exists !!!' })
            } else {
                SubServiceRepo.add(Options).then(created => {
                    console.log(created)
                    if (created) {
                        resolve({ success: true, message: 'Sub Service has been created successfully !!!' })
                    } else {
                        resolve({ success: false, message: 'Error Enocuntered while creating sub service..' })
                    }
                })
            }
        }).catch(err => {
            reject(err);
        })
    })
}

exports.GetAllServices = (pagenumber = 1, pagesize = 20) => {
    return new Promise((resolve, reject) => {
        services.find({}).skip((parseInt(pagenumber - 1) * parseInt(pagesize))).limit(parseInt(pagesize))
            .then(data => {
                if (data) {
                    resolve({ success: true, message: data })
                } else {
                    resolve({ success: false, message: 'could not your search !!!' })
                }
            }).catch(err => {
                reject(err);
            })

    });
}

exports.GetAllSubServices = (pagenumber = 1, pagesize = 20) => {
    return new Promise((resolve, reject) => {
        subService.find({}).skip((parseInt(pagenumber - 1) * parseInt(pagesize))).limit(parseInt(pagesize))
            .then(data => {
                if (data) {
                    resolve({ success: true, message: data })
                } else {
                    resolve({ success: false, message: 'could not your search !!!' })
                }
            }).catch(err => {
                reject(err);
            })

    });
}

exports.GetServiceById = (Id) => {
    return new Promise((resolve, reject) => {
        services.findById({ _id: Id }).then(data => {
            if (data) {
                resolve({ success: true, message: data })
            } else {
                resolve({ success: false, message: 'Could not get Service' })
            }
        }).catch(err => {
            reject(err);
        })
    })
}

exports.GetSubServiceById = (Id) => {
    return new Promise((resolve, reject) => {
        subService.findById({ _id: Id }).then(data => {
            if (data) {
                resolve({ success: true, message: data })
            } else {
                resolve({ success: false, message: 'Could not get Sub Service' })
            }
        }).catch(err => {
            reject(err);
        })
    })
}

exports.GetSubServiceByServiceId = (serviceId) => {
    console.log(serviceId)
    return new Promise((resolve, reject) => {
        subService.find({ serviceId: serviceId }).then(data => {
            if (data.length) {
                resolve({ success: true, data: data })
            } else {
                resolve({ success: false, message: 'Could not get Sub Service' })
            }
        }).catch(err => {
            reject(err);
        })
    })
}

exports.DeleteService = (Id) => {
    return new Promise((resolve, reject) => {
        services.findByIdAndRemove({ _id: Id }).then(data => {
            if (data) {
                resolve({ success: true, message: 'Service deleted successfully ' })
            } else {
                resolve({ success: false, message: 'Could not delete Service' })
            }
        }).catch(err => {
            reject(err);
        })
    })
}

exports.UpdateService = function (id, data) {
    return new Promise((resolve, reject) => {
        ServiceRepo.updateByQuery({ _id: id }, data).then(updated => {
            if (updated) {
                ServiceRepo.getById(updated._id)
                    .then(data => resolve({ success: true, data: data, message: "your Service was updated successfully" }))
                    .catch(err => resolve({ success: false, data: err, message: "unable to update Service" }))
            }
        }).catch(err => {
            reject({ success: false, data: err, message: "Error Updating service " });
        });
    })
}


exports.SearchService = function (option) {
    return new Promise((resolve, reject) => {
        services.find({ name: { $regex: option, $options: 'i' } })
            .exec((err, found) => {
                if (err) { reject(err); }
                if (found == null || Object.keys(found).length === 0) {
                    resolve({ success: false, data: {}, message: "We could not find what you are looking for." })
                } else {
                    resolve({ success: true, data: found, message: "" });
                }
            })
    })
}