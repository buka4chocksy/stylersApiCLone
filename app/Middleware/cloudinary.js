var cloudinary = require('cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

exports.uploadToCloud = function(filename){
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(filename, function(result)
        {
          
            resolve({url: result.secure_url, ID: result.public_id});
        }, {resource_type: "auto"});
    });
}


// exports.upload = function(file){
//     return new Promise(resolve => {
//         cloudinary.uploader.upload(file, function(result){
//             resolve({url: result.secure_url, Id: result.public_id});
//         }, {resource_type: "auto"})
//    })
// }

exports.deleteFromCloud = function(publicID){
    return new Promise((resolve,reject) => {
        cloudinary.uploader.destroy(publicID, function(result){
            resolve(result);
        });
    });
}

exports.multipleUpload = function(filenames = []){
    console.log("in clodinary method", filenames)
    return new Promise((resolve, reject) => {
        var responses = [];
      var newNonEmptyArray =   filenames.filter((value, index) => {
                return value !== '' && value !== null ;
        });
        if(newNonEmptyArray && newNonEmptyArray.length === 0){
            resolve(responses)}else{
                newNonEmptyArray.forEach((file, index) => {
                    if(file !== ''){
                          cloudinary.uploader.upload(file).then(result=>{
                                responses.push({
                                    url: result.secure_url,
                                    ID: result.public_id
                     });
                     if (index == newNonEmptyArray.length-1){
                        resolve(responses);
                     }  
                }
                ).catch(error => {
                    reject(error);
                });
            }else{
                    resolve([]);
            }
        })
    }
    })
}