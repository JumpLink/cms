var easyimg = require('easyimage');
var path = require('path');
var fs = require('fs-extra');

// var UPLOAD_FOLDER =  path.resolve(sails.config.paths.tmp, sails.config.paths.uploads);
var SITES_FOLDER = path.resolve(sails.config.paths.public, sails.config.paths.sites);

var generateThumbnail = function (site, file, options, callback) {
  file.thumb = "thumb_"+file.uploadedAs;
  var src = path.join(SITES_FOLDER, site, options.path, file.uploadedAs);
  var dst = path.join(SITES_FOLDER, site, options.path, file.thumb);
  fs.mkdirs(path.dirname(dst), function(err) {
    if(err) {
      sails.log.error(err);
      callback(err);
    } else {
      easyimg.thumbnail({
        src: src,
        dst: dst,
        width: options.width
      }).then( function(image) {
        sails.log.info("Thumbnail generated", dst);
        callback(null, file);
        // copy files to public tmp folder
      }, function (err) {
        sails.log.error(err);
        callback(err, file);
      });
    }
  });
};

var convertFileIterator = function (site, file, relativePathInSiteFolder, thumbnailOptions, callback) {
  file.uploadedAs = path.basename(file.fd);
  file.savedTo = path.join(SITES_FOLDER, site, relativePathInSiteFolder, file.uploadedAs);
  file.dirname = path.dirname(file.savedTo);

  fs.mkdirs(file.dirname, function(err){
    if (err) callback(err);
    // move file to puplic path
    fs.move(file.fd, file.savedTo, function(err){
      if (err) callback(err);
      else {
        sails.log.debug("moved file: "+file.fd+" -> "+file.savedTo);
        if(thumbnailOptions !== null && thumbnailOptions.width) {
          generateThumbnail(site, file, thumbnailOptions, function (err) {
            if (err) callback(err);
            // sails.log.debug(file);
            callback(null, file);
          });
        } else {
          callback(null, file);
        }
      }
    });
  });
};

var upload = function (req, relativePathInSiteFolder, thumbnailOptions, cb) {
  // sails.log.debug(req.file);

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

      MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, config) {
        if(err) { return res.serverError(err); }
        async.map(files, function (file, cb) {
          convertFileIterator(config.name, file, relativePathInSiteFolder, thumbnailOptions, cb);
        }, function(err, files) {
          var result = {
            message: files.length + ' file(s) uploaded successfully!',
            files: files
          };
          return cb(null, result);
        });
      });
    }
  });
};

module.exports = {
  convertFileIterator: convertFileIterator,
  upload: upload
}
