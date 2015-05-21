var easyimg = require('easyimage');
var underscore = require('underscore'); // http://documentcloud.github.io/underscore/
var path = require('path');
var fs = require('fs-extra');

// TODO move to global
var UPLOAD_FOLDER =  path.resolve(sails.config.paths.tmp, sails.config.paths.uploads);
var SITES_FOLDER = path.resolve(sails.config.paths.public, sails.config.paths.sites);

// server compatibility to angular functions
// TODO auslagern in eigene Library
var $filter = function(filtername) {
  switch (filtername) {
    case 'orderBy':
      return underscore.sortBy;
    break;
  }
}

// TODO testme
var sort = function(members) {
  return $filter('orderBy')(members, 'position');
}

var generateThumbnail = function (site, file, callback) {

  file.thumb = "thumb_"+file.uploadedAs;

  var src = path.join(SITES_FOLDER, site, sails.config.paths.members, file.uploadedAs);
  var dst = path.join(SITES_FOLDER, site, sails.config.paths.members, file.thumb);

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
  file.savedTo = path.join(SITES_FOLDER, site, sails.config.paths.members, file.uploadedAs);
  file.dirname = path.dirname(file.savedTo);

  fs.mkdirs(file.dirname, function(err){
    if (err) callback(err);
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

module.exports = {
  sort: sort,
  convertFileIterator: convertFileIterator,
}
