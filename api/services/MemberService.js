var easyimg = require('easyimage');
var underscore = require('underscore'); // http://documentcloud.github.io/underscore/
var path = require('path');
var fs = require('fs-extra');

console.log(sails.config.paths.tmp);

var UPLOAD_FOLDER =  path.resolve(sails.config.paths.tmp, 'uploads');
var MEMBER_FILE_DIR = path.resolve(sails.config.paths.public, 'assets/images/members');
// var BACKUP_MEMBER_FILE_DIR = path.normalize(__dirname+'/../../assets/images/members');

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

var generateThumbnail = function (file, callback) {

  file.thumb = "thumb_"+file.uploadedAs;

  var src = MEMBER_FILE_DIR+"/"+file.uploadedAs;
  var dst = MEMBER_FILE_DIR+"/"+file.thumb;

  easyimg.thumbnail({
    src: src,
    dst: dst,
    width: 280
  }).then( function(image) {
    sails.log.debug("Thumbnail generated", dst);
    callback(null, file);
    // copy files to public tmp folder
  }, function (error) {
    sails.log.error(error);
    callback(error, file);
  });
}

var convertFileIterator = function (file, callback) {
  file.uploadedAs = path.basename(file.fd);
  file.savedTo = MEMBER_FILE_DIR+"/"+file.uploadedAs;

  // move file to puplic path
  fs.move(file.fd, file.savedTo, function(err){
    if (err) callback(err);
    else {
      sails.log.debug("moved file: "+file.fd+" -> "+file.savedTo);
      // copy file to backup path
      generateThumbnail(file, function (err) {
        if (err) callback(err);
        else callback(null, file);
      });
    }
  });
}

module.exports = {
  sort: sort,
  convertFileIterator: convertFileIterator,
}
