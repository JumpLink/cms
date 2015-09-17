/**
 * 
 */

var easyimg = require('easyimage');
var path = require('path');
var fs = require('fs-extra');
var async = require('async');

// var UPLOAD_FOLDER =  path.resolve(sails.config.paths.tmp, sails.config.paths.uploads);
var SITES_FOLDER = path.resolve(sails.config.paths.public, sails.config.paths.sites);

/**
 * Check if mime type is an image
 */
var isImage = function (mime) {
  return mime.match('image.*') !== null;
}

/**
 * Create square thumbnails.
 * @see https://github.com/hacksparrow/node-easyimage
 */
var generateThumbnail = function (site, file, options, callback) {
  if(options === null || UtilityService.isUndefined(options) || UtilityService.isUndefined(options.thumbnail)) return callback();
  file.thumb = "thumb_"+file.uploadedAs;
  var thumbnailOptions = options.thumbnail;
  thumbnailOptions.src = path.join(SITES_FOLDER, site, options.path, file.uploadedAs);
  thumbnailOptions.dst = path.join(SITES_FOLDER, site, options.path, file.thumb);
  // sails.log.debug("[FileService.generateThumbnail] thumbnailOptions", JSON.stringify(thumbnailOptions, null, 2));
  fs.mkdirs(path.dirname(thumbnailOptions.dst), function(err) {
    if(err) {
      sails.log.error(err);
      return callback(err);
    }
    easyimg.thumbnail(thumbnailOptions).then( function(image) {
      // sails.log.debug("[FileService.generateThumbnail] Thumbnail generated", thumbnailOptions.dst);
      callback(null, file);
    }, function (err) {
      sails.log.error(err);
      callback(err, file);
    });
  });
};

/**
 * Resize and crop and image in one go, useful for creating customzied thumbnails.
 * @see https://github.com/hacksparrow/node-easyimage
 */
var generateRescrop = function (site, file, options, callback) {
  if(options === null || UtilityService.isUndefined(options) || UtilityService.isUndefined(options.rescrop)) return callback();
  file.rescrop = "rescrop_"+file.uploadedAs;
  var rescropOptions = options.rescrop;
  rescropOptions.src = path.join(SITES_FOLDER, site, options.path, file.uploadedAs);
  rescropOptions.dst = path.join(SITES_FOLDER, site, options.path, file.rescrop);
  // sails.log.debug("[FileService.generateRescrop] rescropOptions", JSON.stringify(rescropOptions, null, 2));
  fs.mkdirs(path.dirname(rescropOptions.dst), function(err) {
    if(err) return callback(err);
    easyimg.rescrop(rescropOptions).then( function(image) {
      // sails.log.debug("[FileService.generateRescrop] rescrop generated", rescropOptions.dst);
      callback(null, file);
    }, function (err) {
      callback(err, file);
    });
  });
};

/**
 * Convert image file for upload.
 * Generate thumbnail, rescrop etc if this is set in options.
 */
var convertImageIterator = function (site, file, relativePathInSiteFolder, options, callback) {
  sails.log.debug("[FileService.convertImageIterator] options", options, "isImage: "+file.isImage);
  async.parallel({
    thumb: function (callback) {
      generateThumbnail(site, file, options, callback);
    },
    rescrop: function (callback) {
      generateRescrop(site, file, options, callback);
    }
  },
  function(err, results) {
    if (err) return callback(err);
    if(results.thumb) file.thumb = results.thumb.thumb;
    if(results.rescrop) file.rescrop = results.rescrop.rescrop;
    // sails.log.debug("[FileService.convertImageIterator] file", file);
    callback(null, file);
  });
}

/**
 * Convert general file for upload
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
 * Public functions
 */
module.exports = {
  convertFileIterator: convertFileIterator,
  upload: upload,
  parseFileOptions: parseFileOptions
};