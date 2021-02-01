exports.GetUserId = (model,PublicId = "") => {
    return new Promise((resolve, reject) => {
        model.findOne({ publicId: PublicId }).then((data) => {           
            if (data) {
                resolve(data);
            } else {
                resolve(null);
            }
        }).catch((err) => {
            reject(err);
        })
    })
}