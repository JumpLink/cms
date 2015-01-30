var easyimg = require('easyimage');
var underscore = require('underscore'); // http://documentcloud.github.io/underscore/
var path = require('path');
var fs = require('fs-extra');

var UPLOAD_FOLDER =  path.normalize(__dirname+'/../../.tmp/uploads');
var MEMBER_FILE_DIR = path.normalize(__dirname+'/../../.tmp/public/images/members');
var BACKUP_MEMBER_FILE_DIR = path.normalize(__dirname+'/../../assets/images/members');

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

  var src = BACKUP_MEMBER_FILE_DIR+"/"+file.uploadedAs;
  var dst = MEMBER_FILE_DIR+"/"+file.thumb;
  var dst_backup = BACKUP_MEMBER_FILE_DIR+"/"+file.thumb;

  easyimg.thumbnail({
    src: src,
    dst: dst,
    width: 280
  }).then( function(image) {
    sails.log.debug("Thumbnail generated", dst, dst_backup);
    // copy files to public tmp folder
    fs.copy(dst, dst_backup, function(error) {
      if (error) return callback(error, file);
      else {
        callback(null, file);
      }
    });
  }, function (error) {
    sails.log.error(error);
    callback(error, file);
  });
}

var convertFileIterator = function (file, callback) {
  file.uploadedAs = path.basename(file.fd);
  file.savedTo = MEMBER_FILE_DIR+"/"+file.uploadedAs;
  file.backupedTo = BACKUP_MEMBER_FILE_DIR+"/"+file.uploadedAs;

  // move file to puplic path
  fs.move(file.fd, file.savedTo, function(err){
    if (err) callback(err);
    else {
      sails.log.debug("moved file: "+file.fd+" -> "+file.savedTo);
      // copy file to backup path
      fs.copy(file.savedTo, file.backupedTo, function(err){
        if (err) callback(err);
        else {
          sails.log.debug("copied file: "+file.savedTo+" -> "+file.backupedTo);
          generateThumbnail(file, function (error) {
            if (error) callback(error);
            else callback(null, file);
          });
        }
      });
    }
  });
}

module.exports = {
  sort: sort,
  convertFileIterator: convertFileIterator,
}
