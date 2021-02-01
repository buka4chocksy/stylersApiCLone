const _fs = require('fs'),
    _async = require('async'),
    _cloudinary = require('cloudinary').v2;


/**
 * 
 * @param {Object=} options options to pass to cloudinary
 * @param {Object} config config object to setup cloudinary
 */
function cloudinaryHelper(options, config) {
    if (Array.prototype.slice.call(arguments).length === 1) {
        config = options;
        options = {};
    }
    return function (file, callback) {
        _cloudinary.config(config);
        _cloudinary.uploader.upload(file, options, (error, image) => {
            if (error) {
                callback(error);
            } else {
                callback(null, image);
            }
        });
    }
}

/**
 * @param {String} propertyName the property name to search for in request.body
 * @param {Number=} nameLength the length of the random string generated for the name of the file to save
 * @param {Function=} extend function to extend the middleware
 * @returns {Function} an express middleware with params request, response, next
 */
function base64ToFile(propertyName, nameLength = 20, extend) {
    let args = Array.prototype.slice.call(arguments);
    if (args.length === 2 && typeof args[args.length - 1] === 'function') {
        extend = nameLength;
        nameLength = 20;
    }
    return function (request, response, next) {
        let data,
            prop = propertyName.split(" ")[0];
        if (prop.endsWith("[]")) {
            data = Object.assign([], request.body[prop]);
            if (!data.length) return next();
            prop = prop.split("[")[0];
            let tasks = data.map(d => dataToFile.bind(null, d, nameLength, extend));
            _async.parallel(tasks, (error, filePaths) => {
                if (error) {
                    console.log("there were errors saving the file, ", error);
                }
                request.body[prop] = filePaths;
                return next();
            });
        } else {
            data = request.body[prop];
            if (!data) return next();
            dataToFile(data, nameLength, extend, (error, pathForDb) => {
                if (error) {
                    console.log("the file did not save successfully ", error);
                }
                request.body[prop] = pathForDb;
                return next();
            });
        }
    }
}

/**
 * 
 * @param {Object} data object containing information about the file
 * @param {String} data.base64 base64 string of the file
 * @param {String} data.mime mime type for the file
 * @param {Number} nameLength length of the generated file name
 * @param {Function} extend function to extend the definitions of this method. should typically be the cloudinary helper closure
 * @param {Function} callback callback function
 */
function dataToFile(data, nameLength, extend, callback) {
    if (Array.prototype.slice.call(arguments).length === 3) {
        callback = extend;
        extend = undefined;
    }
    if (extend) {
        return extend(`data:${data.mime};base64,${data.base64}`, callback);
    }
    const buffer = new Buffer(data.base64, 'base64');
    let type = getTypeFromMime(data.mime);
    const {
        path,
        pathForDb
    } = generateFileName(type, nameLength);
    _fs.writeFile(path, buffer, (err) => console.log("did not wait for the file to finish saving. " + err));
    callback(null, pathForDb);
}

/**
 * 
 * @param {String} type format for the file
 * @param {Number} nameLength length of the generated file name
 */
function generateFileName(type, nameLength) {
    let code = randomCodeGenerator({
        alphaNumeric: true,
        size: nameLength,
        allowedCharacters: "aA#"
    }),
        pathForDb = `/uploads/${code}.${type}`,
        path = `${process.cwd()}/public${pathForDb}`,
        exists = _fs.existsSync(path);
    while (exists) {
        code = randomCodeGenerator({
            alphaNumeric: true,
            size: nameLength,
            allowedCharacters: "aA#"
        }),
            pathForDb = `/uploads/${code}.${type}`,
            path = `${process.cwd()}/public${pathForDb}`,
            exists = _fs.existsSync(path);
    }
    return {
        path,
        pathForDb
    };
}

/**
 * 
 * @param {String} mime mime type of the file
 */
function getTypeFromMime(mime) {
    switch (mime) {
        case 'image/jpeg' || 'image/jpg':
            return "jpg";
        case 'image/png':
            return "png";
        case 'image/mpeg' || 'video/mp4' || 'video/mpeg':
            return "mp4";
        default:
            return "";
    }
}

/**
 * 
 * @param {Object} options options object passed as parameter
 * @param {Boolean=} options.alphaNumeric
 * @param {Number} options.size
 * @param {String=} options.allowedCharacters
 */
function randomCodeGenerator({
    alphaNumeric,
    size,
    allowedCharacters
}) {
    if (alphaNumeric) {
        var container = "";
        if (allowedCharacters.indexOf("a") > -1) container += "abcdefghijklmnopqrstuvwxyz";
        if (allowedCharacters.indexOf("A") > -1) container += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        if (allowedCharacters.indexOf("#") > -1) container += "0123456789";
        if (allowedCharacters.indexOf("!") > -1) container += "~`!@#$%^&*()_+-={}[]:\";'<>?,./|\\";
        var result = "";
        for (var i = 0; i < size; i++) result += container[Math.floor(Math.random() * container.length)];
        return result;
    }
    return Math.floor(Math.random() * Math.floor(Math.pow(10, size - 1)));
};

module.exports = {
    base64ToFile,
    cloudinaryHelper,
    randomCodeGenerator
};