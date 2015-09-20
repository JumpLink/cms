/**
 * FileService
 *
 * @module FileService
 *
 * @requires easyimg - https://github.com/hacksparrow/node-easyimage
 * @requires path - https://nodejs.org/api/path.html
 * @requires fs-extra - https://github.com/jprichardson/node-fs-extra
 * @requires async - https://github.com/caolan/async
 */

var easyimg = require('easyimage');
var path = require('path');
var fs = require('fs-extra');
var async = require('async');

var SITES_FOLDER = path.resolve(sails.config.paths.public, sails.config.paths.sites);

/**
 * Check if mime type is an image
 *
 * @alias module:FileService.isImage
 */
var isImage = function (mime) {
  return mime.match('image.*') !== null;
}

/**
 * Create square thumbnails.
 *
 * @alias module:FileService.generateThumbnail
 * @see https://github.com/hacksparrow/node-easyimage
 */
var generateThumbnail = function (site, file, options, callback) {
  if(options === null || UtilityService.isUndefined(options) || UtilityService.isUndefined(options.thumbnail)) return callback();
  file.thumbName = "thumb_"+file.uploadedAs;
  var thumbnailOptions = options.thumbnail;
  thumbnailOptions.src = path.join(SITES_FOLDER, site, options.path, file.uploadedAs);
  thumbnailOptions.dst = path.join(SITES_FOLDER, site, options.path, file.thumbName);
  // sails.log.debug("[FileService.generateThumbnail] thumbnailOptions", JSON.stringify(thumbnailOptions, null, 2));
  fs.mkdirs(path.dirname(thumbnailOptions.dst), function(err) {
    if(err) {
      sails.log.error(err);
      return callback(err);
    }
    easyimg.thumbnail(thumbnailOptions).then( function(image) {
      // sails.log.debug("[FileService.generateThumbnail] Thumbnail generated", thumbnailOptions.dst);
      file.thumbObject = image;
      callback(null, file);
    }, function (err) {
      sails.log.error(err);
      callback(err, file);
    });
  });
};

/**
 * Resize and crop and image in one go, useful for creating customzied thumbnails.
 *
 * @alias module:FileService.generateRescrop
 * @see https://github.com/hacksparrow/node-easyimage
 */
var generateRescrop = function (site, file, options, callback) {
  if(options === null || UtilityService.isUndefined(options) || UtilityService.isUndefined(options.rescrop)) return callback();
  file.rescropName = "rescrop_"+file.uploadedAs;
  var rescropOptions = options.rescrop;
  rescropOptions.src = path.join(SITES_FOLDER, site, options.path, file.uploadedAs);
  rescropOptions.dst = path.join(SITES_FOLDER, site, options.path, file.rescropName);
  // sails.log.debug("[FileService.generateRescrop] rescropOptions", JSON.stringify(rescropOptions, null, 2));
  fs.mkdirs(path.dirname(rescropOptions.dst), function(err) {
    if(err) return callback(err);
    easyimg.rescrop(rescropOptions).then( function(image) {
      // sails.log.debug("[FileService.generateRescrop] rescrop generated", rescropOptions.dst);
      file.rescropObject = image;
      callback(null, file);
    }, function (err) {
      callback(err, file);
    });
  });
};

/**
 * Get Image Information for the original Image like width, depth, size, type and etc..
 *
 * @alias module:FileService.setImageInfoForOriginal
 */
var setImageInfoForOriginal = function (options, file, callback) {
  // sails.log.debug("[GalleryService.setInfoForOriginal]", "options", options, "file", file);
  if(UtilityService.isUndefined(file) || UtilityService.isUndefined(file.savedTo)) callback(new Error("file.savedTo is undefined"));
  easyimg.info(file.savedTo).then( function(original) {
    delete original.path;
    callback(null, original);
  }, callback); // error
};

/**
 * Get Image Information for the Thumbnail Image like width, depth, size, type and etc..
 *
 * @alias module:FileService.setImageInfoForThumbnail
 */
var setImageInfoForThumbnail = function (options, file, callback) {
  if(UtilityService.isUndefined(options.thumbnail) || UtilityService.isUndefined(options.thumbnail.dst)) callback();
  easyimg.info(options.thumbnail.dst).then( function(thumb) {
    delete thumb.path;
    callback(null, thumb);
  }, callback); // error
};

/**
 * Get Image Information for the rescrop (resized and cropped) Image like width, depth, size, type and etc..
 *
 * @alias module:FileService.setImageInfoForRescrop
 */
var setImageInfoForRescrop = function (options, file, callback) {
  if(UtilityService.isUndefined(options.rescrop) || UtilityService.isUndefined(options.rescrop.dst)) callback();
  easyimg.info(options.rescrop.dst).then( function(rescrop) {
    delete rescrop.path;
    callback(null, rescrop);
  }, callback); // error
};

/**
 * Convert image file for upload.
 * Generate thumbnail, rescrop etc if this is set in options.
 *
 * @alias module:FileService.convertImageIterator
 */
var convertImageIterator = function (site, file, relativePathInSiteFolder, options, callback) {
  sails.log.debug("[FileService.convertImageIterator] options", options, "isImage: "+file.isImage);
  async.series({
    thumb: function (callback) {
      generateThumbnail(site, file, options, callback);
    },
    rescrop: function (callback) {
      generateRescrop(site, file, options, callback);
    },
    originalInfo: function (callback) {
      setImageInfoForOriginal(options, file, callback);
    },
    thumbnailInfo: function (callback) {
      setImageInfoForThumbnail(options, file, callback);
    },
    rescropInfo: function (callback) {
      setImageInfoForRescrop(options, file, callback);
    }
  },
  function(err, results) {
    if (err) return callback(err);
    if(results.originalInfo) file.original = results.originalInfo;
    if(results.thumbnailInfo) file.thumb = results.thumbnailInfo;
    if(results.rescropInfo) file.rescrop = results.rescropInfo;
    // sails.log.debug("[FileService.convertImageIterator] file", file);
    callback(null, file);
  });
}

/**
 * Convert general file for upload
 *
 * @alias module:FileService.convertFileIterator
 */
var convertFileIterator = function (site, file, relativePathInSiteFolder, options, callback) {
  file.isImage = isImage(file.type);
  file.uploadedAs = path.basename(file.fd);
  file.savedTo = path.join(SITES_FOLDER, site, relativePathInSiteFolder, file.uploadedAs);
  file.dirname = path.dirname(file.savedTo);
  sails.log.debug("[FileService.convertFileIterator] options", "file", file);
  async.series([
    function (callback) {
      fs.mkdirs(file.dirname, callback);
    },
    function (callback) {
      fs.move(file.fd, file.savedTo, callback);
    }
  ],
  function(err, results) {
    if (err) return callback(err);
    if(file.isImage) return convertImageIterator(site, file, relativePathInSiteFolder, options, callback);
    return callback(null, file);
  });
};

/**
 * Upload files and convert them
 *
 * @alias module:FileService.upload
 */
var upload = function (req, relativePathInSiteFolder, callback) {
  var host = req.session.uri.host;
  var site = null;
  var options = parseFileOptions(req, relativePathInSiteFolder);
  // WORKAROUND for BUG https://github.com/balderdashy/skipper/issues/36
  if(req._fileparser.form.bytesExpected > 10000000) {
    sails.log.error('File exceeds maxSize. Aborting.');
    req.connection.destroy();
    return callback('File exceeds maxSize. Aborting.');
  }

  req.file("file").upload(function (err, files) {
    if (err) {
      sails.log.error(err);
      return callback(err);
    } else {

      MultisiteService.getCurrentSiteConfig(host, function (err, config) {
        if(err) return res.serverError(err);
        site = config.name;
        async.map(files, function (file, callback) {
          convertFileIterator(site, file, relativePathInSiteFolder, options, callback);
        }, function(err, files) {
          if(err) return callback(err);
          var result = {
            message: files.length + ' file(s) uploaded successfully!',
            files: files,
            site: site
          };
          return callback(null, result);
        });
      });
    }
  });
};

/**
 * Upload a file for the gallery and save file in gallery database
 *
 * @alias module:FileService.parseFileOptions
 */
var parseFileOptions = function (req, path) {
  var options = JSON.parse(req.headers.options);
  var defaults = {
    path: path,
    thumbnail: {
      width: 300,
      path: path
    },
    rescrop: {
      width: 960 * 3, // width og bootstrap content width * 3 for hidpi
      cropwidth: 960 * 3,
      cropheight: 720 * 3,
    }
  }
  options = UtilityService.extend(true, defaults, options);
  return options;
}

/**
 *
 * @alias module:FileService.removeFromFilesystem
 */
var removeFromFilesystem = function (site, file, relativePathInSiteFolder, callback) {
  var dirname = path.join(SITES_FOLDER, site, relativePathInSiteFolder);
  sails.log.debug("[FileService,removeFromFilesystem]", "dirname", dirname, file);
  async.parallel([
    function removeFile(callback){
      if(UtilityService.isUndefined(file.uploadedAs) || file.uploadedAs === null) return callback();
      var filepath = path.join(dirname, file.uploadedAs);
      return fs.remove(filepath, callback);
    },
    function removeOriginalImage(callback){
      if(UtilityService.isUndefined(file.original) || file.original === null) return callback();
      var filepath = path.join(dirname, file.original.name);
      return fs.remove(filepath, callback);
    },
    function removeThumbnailImage(callback){
      if(UtilityService.isUndefined(file.thumb) || file.thumb === null) return callback();
      var filepath = path.join(dirname, file.thumb.name);
      return fs.remove(filepath, callback);
    },
    function removeThumbnailImage(callback){
      if(UtilityService.isUndefined(file.rescrop) || file.rescrop === null) return callback();
      var filepath = path.join(dirname, file.rescrop.name);
      return fs.remove(filepath, callback);
    },
  ],
  callback);
}

/**
 * Public functions
 */
module.exports = {
  isImage: isImage,
  generateThumbnail: generateThumbnail,
  convertFileIterator: convertFileIterator,
  upload: upload,
  parseFileOptions: parseFileOptions,
  removeFromFilesystem: removeFromFilesystem,
  deleteFromFilesystem: removeFromFilesystem, // alias
};