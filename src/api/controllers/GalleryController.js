/**
 * DocumentController
 *
 * @description :: Server-side logic for managing documents
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var path = require('path');
var fs = require('fs-extra');
var easyimg = require('easyimage');

var TMP_UPLOADPATH =  path.normalize(__dirname+'/../../.tmp/uploads');
var TMP_PUBLICPATH =  path.normalize(__dirname+'/../../.tmp/public');
var PUBLICPATH =  path.normalize(__dirname+'/../../assets');
var HTML_THUMBPATH = "/images/gallery/thumbs"                           // path to use in html src attribute
var TMP_THUMBPATH = TMP_PUBLICPATH + HTML_THUMBPATH                     // full path on tmp file system
var THUMBPATH = PUBLICPATH + HTML_THUMBPATH                             // full path on developer source file system
var HTML_IMAGEPATH = "/images/gallery/full"                             // path to use in html src attribute
var TMP_IMAGEPATH = TMP_PUBLICPATH + HTML_IMAGEPATH                     // full path on tmp file system
var IMAGEPATH = PUBLICPATH + HTML_IMAGEPATH                             // full path on developer source file system

module.exports = {
  /**
   * `OdfController.create()`
   */
  upload: function (req, res) {
    req.file("documents").upload(function (err, files) {
      if (err) {
        sails.log.error(err);
        return res.serverError(err);
      }

      for (var i = 0; i < files.length; i++) {
        files[i].uploadedAs = path.basename(files[i].fd);
      };

      return res.json({
        message: files.length + ' file(s) uploaded successfully!',
        files: files
      });
    });
  },

  generateThumbnails: function(req, res) {

    fs.mkdirs(TMP_IMAGEPATH, function (err) {
      fs.mkdirs(TMP_THUMBPATH, function (err) {
        start();
      });
    });

    var generateThumb = function (file, callback) {
      // var src = TMP_IMAGEPATH + "/" + file;
      var tmp_dst = TMP_THUMBPATH + "/" + file;
      var src = IMAGEPATH + "/" + file;
      var dst = THUMBPATH + "/" + file;
      // console.log("src"+src);
      // console.log("dst"+dst);
      // sails.log.info(easyimg.info(src));
      easyimg.thumbnail({
        src: src,
        dst: dst,
        width: 240
      }).then( function(image) {
        // copy files to public tmp folder
        fs.copy(dst, tmp_dst, function(err){
          if (err) callback(err);
          else callback();
        });
      });
    }

    var start = function () {
      fs.readdir(TMP_IMAGEPATH, function(error, files) {
        sails.log.info(files);
        async.eachSeries(files, generateThumb, function(err){
          return res.json({
            message: 'All files have been processed successfully'
          });
        });
      });
    }

  },

  get: function(req, res) {
    fs.readdir(TMP_THUMBPATH, function(error, files) {
      var iterator = function (file, callback) {
        var thumbPath = HTML_THUMBPATH + "/" + file;
        var originalPath = HTML_IMAGEPATH + "/" + file;
        var tmpThumbPath = TMP_THUMBPATH + "/" + file;
        var tmpOriginalPath = TMP_IMAGEPATH + "/" + file;

        // get information about thumb
        easyimg.info(tmpThumbPath).then(
          function(thumbInfo) {
            thumbInfo.path = thumbPath;

            // get information about original
            easyimg.info(tmpOriginalPath).then(
              function(originalInfo) {
                originalInfo.path = originalPath;
                callback(null, {original:originalInfo, thumb:thumbInfo});
              }, function (err) {
                callback(err);
              }
            );
          }, function (err) {
            callback(err);
          }
        );
      }
      async.map(files, iterator, function(err, transformedFiles){
        return res.json({
          error: error,
          files: transformedFiles
        });
      });
    });
  }
};
