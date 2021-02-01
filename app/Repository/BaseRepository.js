function BaseRepository(model) {
    this.SchemaModel = model;
};

BaseRepository.prototype.getAll = function (page = 1, pageSize = 30) {
    return new Promise((resolve, reject) => {
        this.SchemaModel.find({}).skip((page - 1) * pageSize)
            .limit((pageSize)).exec((err, result) => {
                if (err) { reject(err); }
                else { resolve(result); }
            });
    });

}


BaseRepository.prototype.get = function (query = {}, page = 1, pageSize = 30) {
    if(page == 1)
    return new Promise((resolve, reject) => {
        this.SchemaModel.find(query).skip((page - 1) * pageSize)
            .limit((pageSize)).exec((err, result) => {
                if (err) { reject(err); }
                else { resolve(result); }
            });
    });

}
BaseRepository.prototype.getBy = function (query = {}, select = undefined, populate = "", page = 1, pageSize = 30) {
    
    return new Promise((resolve, reject) => {
        if(page < 1) {
            reject("Page cannot be less than 1");
        }
            this.SchemaModel
            .find(query).select(select !== undefined ? select : '')
            .skip((page - 1) * pageSize)
            .limit(pageSize).populate(populate)
            .exec((err, result) => {
                if (err) { reject(err); }
                else { resolve(result); }
            });

    });
}

BaseRepository.prototype.getSingleBy = function (query = {}, select = null) {
    console.log("select check", select != null);
    return new Promise((resolve, reject) => {
        if (select != null) {
            this.SchemaModel.findOne(query).select(select).exec((err, currentData) => {
                if (err) { reject(err); }
                else { resolve(currentData); }
            });
        }else{
            console.log("in else of single    ")
        return this.SchemaModel.findOne(query).exec((err, currentData) => {
            if (err) { reject(err); }
            else { resolve(currentData); }
        });
    }
    })

}

BaseRepository.prototype.getById = function (id) {
    return new Promise((resolve, reject) => {
        this.SchemaModel.findById(id).exec((err, result) => {
            if (err) { reject(err); }
            else { resolve(result); }
        });
    })
}

BaseRepository.prototype.add = function (data) {
    return new Promise((resolve, reject) => {
        this.SchemaModel.create(data, (err, currentData) => {
            if (err) { reject(err); }
            else { resolve(currentData); }
        });
    })
}

BaseRepository.prototype.addMany = function (data = []) {
    //implement this later
}
BaseRepository.prototype.updateById = function (query, data) {
    return new Promise((resolve, reject) => {
        this.SchemaModel.findByIdAndUpdate(query, data).exec((err, data) => {
            if (err) { reject(err); }
            else { resolve(data); }
        });
    });
};

BaseRepository.prototype.updateByQuery = function (query = {}, data = {}) {
    return new Promise((resolve, reject) => {
        this.SchemaModel.update(query, data).exec((err, data) => {
            if(err) {reject(err)}
            else{resolve(data)};
        })
    });
};


BaseRepository.prototype.updateSpecificFields = function(query,data){
    return new Promise((resolve,reject)=> {
        this.SchemaModel.findByIdAndUpdate(query,{$set: data},{upsert: true})
        .exec((err,data) => {
            if(err) { reject(err); }
            else { resolve(data); }
        })
    })
}

BaseRepository.prototype.updateSpecificFieldsByQuery = function(query = {}, data ={}){
    return new Promise((resolve,reject)=> {
        this.SchemaModel.findOne(query,{$set: data},{upsert: true})
        .exec((err,data) => {
            if(err) { reject(err); }
            else { resolve(data); }
        })
    })
}

BaseRepository.prototype.updatMany = function (query, data) {
    return new Promise((resolve, reject) => {
        this.SchemaModel.updataMany(query, data).exec((err, data) => {
            if (err) { reject(err); }
            else { resolve(data); }
        });
    });
}

BaseRepository.prototype.delete = function (query) {
    return new Promise((resolve, reject) => {
        this.SchemaModel.findByIdAndDelete(query).exec((err, data) => {
            if (err) { reject(err); }
            else { resolve(data); }
        });
    });
}

BaseRepository.prototype.deleteMany = function (query) {
    return new Promise((resolve, reject) => {
        this.SchemaModel.deleteMany(query).exec((err, data) => {
            if (err) { reject(err); }
            else { resolve(data); }
        });
    });
}

BaseRepository.prototype.count = function (query) {
    return new Promise((resolve, reject) =>
        this.SchemaModel.countDocuments(query).exec((err, data => {
            if (err) { reject(err) }
            else { resolve(data) }
        }))
    )
}

BaseRepository.prototype.AddAndSaveWithArray = function(data = {}, key = "", arrayToSave = []){
    return new Promise((resolve, reject) => {
        console.log("Add and save with array", key, arrayToSave)
        this.SchemaModel[key].push(arrayToSave);
        this.SchemaModel.create(data, (err, currentData) => {
            if (err) { reject(err); }
            else { resolve(currentData); }
        });
    })
}
module.exports = BaseRepository;
