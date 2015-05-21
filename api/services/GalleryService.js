var easyimg = require('easyimage');
var underscore = require('underscore'); // http://documentcloud.github.io/underscore/
var path = require('path');
var fs = require('fs-extra');

// TODO move to global
var UPLOAD_FOLDER =  path.resolve(sails.config.paths.tmp, sails.config.paths.uploads);
var SITES_FOLDER = path.resolve(sails.config.paths.public, sails.config.paths.sites);

var generateThumbnail = function (site, file, callback) {
  file.thumb = "thumb_"+file.uploadedAs;
  var src = path.join(SITES_FOLDER, site, sails.config.paths.gallery, file.uploadedAs);
  var dst = path.join(SITES_FOLDER, site, sails.config.paths.gallery, file.thumb);
  fs.mkdirs(path.dirname(dst), function(err) {
    if(err) {
      sails.log.error(err);
      callback(err);
    } else {
      easyimg.thumbnail({
        src: src,
        dst: dst,
        width: 280
      }).then( function(image) {
        sails.log.debug("Thumbnail generated", dst);
        callback(null, file);
        // copy files to public tmp folder
      }, function (err) {
        sails.log.error(err);
        callback(err, file);
      });
    }
  });
}

var convertFileIterator = function (site, file, callback) {
  file.uploadedAs = path.basename(file.fd);
  file.savedTo = path.join(SITES_FOLDER, site, sails.config.paths.gallery, file.uploadedAs);
  file.dirname = path.dirname(file.savedTo);

  fs.mkdirs(file.dirname, function(err){
    if (err) callback(err);
    // move file to puplic path
    fs.move(file.fd, file.savedTo, function(err){
      if (err) callback(err);
      else {
        sails.log.debug("moved file: "+file.fd+" -> "+file.savedTo);
        generateThumbnail(site, file, function (err) {
          if (err) callback(err);
          sails.log.debug(file);
          callback(null, file);
        });
      }
    });
  });
}

var removeFromFilesystem = function(site, file, cb) {
  var gallery_dirname = path.join(SITES_FOLDER, site, sails.config.paths.gallery);
  file.original.path = path.join(gallery_dirname, file.original.name);
  file.thumb.path = path.join(gallery_dirname, file.thumb.name);
  // sails.log.debug("removeFromFilesystem", site, file);
  fs.remove(file.thumb.path, function(err){
    if (err) return cb(err);
    fs.remove(file.original.path, function(err){
      if (err) return cb(err);
      cb(null);
    });
  });
};

var prepearFileForDatabase = function (bind, file, cb) {
  //sails.log.debug("prepearFileForDatabase", bind.site, file);
  // get information about thumb
  easyimg.info(path.join(file.dirname, file.thumb)).then(
    function(thumbInfo) {
      delete thumbInfo.path;
      //sails.log.debug(thumbInfo);
      // get information about original
      easyimg.info(file.savedTo).then(
        function(originalInfo) {
          delete originalInfo.path;
          //sails.log.debug(originalInfo);
          cb(null, {original:originalInfo, thumb:thumbInfo, site:bind.site});
        }, function (err) {
          cb(err);
        }
      );
    }, function (err) {
      cb(err);
    }
  );
}

var prepearFilesForDatabase = function (site, files, images, cb) {
  // sails.log.debug("prepearFilesForDatabase", site, files);
  // get max position
  var last_position = UtilityService.max(images, 'position');
  sails.log.debug("last_position", last_position);
  async.map(files, prepearFileForDatabase.bind(null, {site:site}), function(err, files) {
    if(err) cb(err);
    for (var i = files.length - 1; i >= 0; i--) {
      last_position++;
      files[i].position = last_position;
    };
    cb(null, files);
  });
};

module.exports = {
  generateThumbnail: generateThumbnail
  , convertFileIterator: convertFileIterator
  , prepearFilesForDatabase: prepearFilesForDatabase
  ,removeFromFilesystem: removeFromFilesystem
}
