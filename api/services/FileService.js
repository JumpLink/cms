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
 * Create square thumbnails.
 * @see https://github.com/hacksparrow/node-easyimage
 */
var generateThumbnail = function (site, file, options, callback) {
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
  if(UtilityService.isUndefined(options) || UtilityService.isUndefined(options.rescrop)) callback();
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
 * 
 */
var convertFileIterator = function (site, file, relativePathInSiteFolder, options, callback) {
  file.uploadedAs = path.basename(file.fd);
  file.savedTo = path.join(SITES_FOLDER, site, relativePathInSiteFolder, file.uploadedAs);
  file.dirname = path.dirname(file.savedTo);
  // sails.log.debug("[FileService.convertFileIterator] options", options);

  // an example using an object instead of an array
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
    sails.log.debug("moved file: "+file.fd+" -> "+file.savedTo);
    async.parallel({
      thumb: function (callback) {
        generateThumbnail(site, file, options, callback);
      },
      rescrop: function (callback) {
        generateRescrop(site, file, options, callback);
      }
    },
    function(err, results) {
      if (err) {
        // err = new Error(err);
        sails.log.error(err);
        return callback(err);
      }
      if(results.thumb) file.thumb = results.thumb.thumb;
      if(results.rescrop) file.rescrop = results.rescrop.rescrop;
      // sails.log.debug("[FileService.convertFileIterator] file", file);
      callback(null, file);
    });
  });
};

/**
 * 
 */
var upload = function (req, relativePathInSiteFolder, options, cb) {
  var host = req.session.uri.host;
  var site = null;

  // WORKAROUND for BUG https://github.com/balderdashy/skipper/issues/36
  if(req._fileparser.form.bytesExpected > 10000000) {
    sails.log.error('File exceeds maxSize. Aborting.');
    req.connection.destroy();
    return cb('File exceeds maxSize. Aborting.');
  }

  req.file("file").upload(function (err, files) {
    if (err) {
      sails.log.error(err);
      return cb(err);
    } else {

      MultisiteService.getCurrentSiteConfig(host, function (err, config) {
        if(err) return res.serverError(err);
        site = config.name;
        async.map(files, function (file, cb) {
          convertFileIterator(site, file, relativePathInSiteFolder, options, cb);
        }, function(err, files) {
          var result = {
            message: files.length + ' file(s) uploaded successfully!',
            files: files,
            site: site
          };
          return cb(null, result);
        });
      });
    }
  });
};

/**
 * 
 */
module.exports = {
  convertFileIterator: convertFileIterator,
  upload: upload
};