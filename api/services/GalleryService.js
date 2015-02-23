var path = require('path');
var fs = require('fs-extra');                                           // Extra methods for the fs object: https://github.com/jprichardson/node-fs-extra
var easyimg = require('easyimage');                                     // Module for image processing and manipulation: https://github.com/hacksparrow/node-easyimage

var TMP_UPLOADPATH =  path.normalize(__dirname+'/../../.tmp/uploads');
var TMP_PUBLICPATH =  path.normalize(__dirname+'/../../.tmp/public');
var PUBLICPATH =  path.normalize(__dirname+'/../../assets');
var HTML_THUMBPATH = "/images/gallery/thumbs"                           // path to use in html src attribute
var TMP_THUMBPATH = TMP_PUBLICPATH + HTML_THUMBPATH                     // full path on tmp file system
var THUMBPATH = PUBLICPATH + HTML_THUMBPATH                             // full path on developer source file system
var HTML_IMAGEPATH = "/images/gallery/full"                             // path to use in html src attribute
var TMP_IMAGEPATH = TMP_PUBLICPATH + HTML_IMAGEPATH                     // full path on tmp file system
var IMAGEPATH = PUBLICPATH + HTML_IMAGEPATH                             // full path on developer source file system

var mkdirs = function (callback) {
  // mkdir -p
  fs.mkdirs(IMAGEPATH, function(err) {
    if (err) return callback(err);
    else {
      fs.mkdirs(TMP_IMAGEPATH, function(err) {
        if (err) return callback(err);
        else {
          fs.mkdirs(THUMBPATH, function(err) {
            if (err) return callback(err);
            else {
              fs.mkdirs(TMP_THUMBPATH, function(err) {
                if (err) return callback(err);
                else {
                  callback(null);
                }
              });
            }
          });
        }
      });
    }
  });
}

var generateThumbnail = function (filename, callback) {
  var tmp_dst = TMP_THUMBPATH + "/" + filename;
  var src = IMAGEPATH + "/" + filename;
  var dst = THUMBPATH + "/" + filename;
  easyimg.thumbnail({
    src: src,
    dst: dst,
    width: 240
  }).then( function(image) {
    sails.log.debug("Thumbnail generated", dst, tmp_dst);
    // copy files to public tmp folder
    fs.copy(dst, tmp_dst, function(error) {
      if (error) return callback(error);
      else callback();
    });
  }, function (error) {
     sails.log.error(error);
     callback(error);
  });
}

var generateThumbnails = function(files, callback) {
  mkdirs(function (error) {
    if (error) return callback(error);
    else {
      async.eachSeries(files, generateThumbnail, function(error) {
        callback(error, 'All files have been processed successfully');
      });
    }
  });
};

var generateThumbnailsFromFilesystem = function(callback) {
  fs.readdir(TMP_IMAGEPATH, function(error, files) {
    if(error) return callback(error);
    generateThumbnails(files, callback)
  });
};

var getFileFromFilesystem = function(filename, callback) {
  var thumbPath = HTML_THUMBPATH + "/" + filename;
  var originalPath = HTML_IMAGEPATH + "/" + filename;
  var tmpThumbPath = TMP_THUMBPATH + "/" + filename;
  var tmpOriginalPath = TMP_IMAGEPATH + "/" + filename;

  // get information about thumb
  easyimg.info(tmpThumbPath).then(
    function(thumbInfo) {
      // TODO
      thumbInfo.path = thumbPath;
      delete thumbInfo.path;

      // get information about original
      easyimg.info(tmpOriginalPath).then(
        function(originalInfo) {
          // TODO
          originalInfo.path = originalPath;
          delete originalInfo.path;
          
          thumbInfo.name = originalInfo.name; // WORKAROUND for thumb name undefined bug
          
          callback(null, {original:originalInfo, thumb:thumbInfo});
        }, function (err) {
          callback(err);
        }
      );
    }, function (err) {
      callback(err);
    }
  );
};

var getFilesFromFilesystem = function(callback) {
  fs.readdir(TMP_THUMBPATH, function(error, files) {
    if (error) return callback(error);
    async.map(files, getFileFromFilesystem, callback);
  });
};

var removeFromFilesystem = function(filename, completly, callback) {
  var thumbPath = HTML_THUMBPATH + "/" + filename;
  var originalPath = HTML_IMAGEPATH + "/" + filename;
  var tmpThumbPath = TMP_THUMBPATH + "/" + filename;
  var tmpOriginalPath = TMP_IMAGEPATH + "/" + filename;

  // remove image from tmp dir
  fs.remove(tmpThumbPath, function(err){
    if (err) return callback(err);
    fs.remove(tmpOriginalPath, function(err){
      if (err) return callback(err);
      // remove image completly (also from development dir)
      if(completly) {
        fs.remove(thumbPath, function(err){
          if (err) return callback(err);
          fs.remove(originalPath, function(err){
            if (err) return callback(err);
            callback(null);
          });
        });
      } else {
        callback(null);
      }
    });
  });
};


var saveFilesFromUpload = function (files, callback) {

  var convertFileIterator = function (file, callback) {
    file.uploadedAs = path.basename(file.fd);
    file.savedTo = IMAGEPATH+"/"+file.uploadedAs;
    file.backupedTo = TMP_IMAGEPATH+"/"+file.uploadedAs;
    file.thumb = {
      savedTo: THUMBPATH+"/"+file.uploadedAs
      , backupedTo: TMP_THUMBPATH+"/"+file.uploadedAs
    };

    // move file to puplic path
    fs.move(file.fd, file.savedTo, function(error) {
      if (error) return callback(error);
      else {
        sails.log.debug("moved file: "+file.fd+" -> "+file.savedTo);
        // copy file to backup path
        fs.copy(file.savedTo, file.backupedTo, function(error) {
          if (error) return callback(error);
          else {
            sails.log.debug("copied file: "+file.savedTo+" -> "+file.backupedTo);
            generateThumbnail(file.uploadedAs, function (error) {
              if(error) return callback(error);
              getFileFromFilesystem(file.uploadedAs, callback);
            });
          }
        });
      }
    });
  }

  // start
  mkdirs(function(error) {
    async.map(files, convertFileIterator, callback);
  });
};


module.exports = {
  generateThumbnails: generateThumbnails
  , generateThumbnail: generateThumbnail
  , generateThumbnailsFromFilesystem: generateThumbnailsFromFilesystem
  , getFilesFromFilesystem: getFilesFromFilesystem
  , getFileFromFilesystem: getFileFromFilesystem
  , removeFromFilesystem: removeFromFilesystem
  , saveFilesFromUpload: saveFilesFromUpload
}
