var path = require('path');
var fs = require('fs-extra'); // Node.js: extra methods for the fs object: https://github.com/jprichardson/node-fs-extra
var UPLOADFOLDER =  path.normalize(__dirname+'/../../.tmp/uploads');
var TIMELINEFILEDIR = path.normalize(__dirname+'/../../.tmp/public/files/timeline');
var BACKUPTIMELINEFILEDIR = path.normalize(__dirname+'/../../assets/files/timeline');

module.exports = {
  setup: function (req, res, next) {
    async.waterfall([
      function destroyAll(callback){
        sails.log.debug("destroyAll");
        Timeline.destroy({}, function (error, destroyed) {
          sails.log.debug(destroyed);
          callback(error);
        });
      },
      function getNewSetup (callback){
        sails.log.debug("getNewSetup Member");
        SetupService.timeline(callback);
      },
      function createNewSetup (newValues, callback){
        sails.log.debug("createNewSetup");
        // https://github.com/caolan/async#map
        async.map(newValues, Timeline.create, callback);
      },
    ], function (err, result) {
      sails.log.debug("done");
      if(err)
        res.json(err);
      else
        res.json(result);
    });
  }

  , upload: function (req, res) {
    sails.log.debug(req.file);

    // WORKAROUND for BUG https://github.com/balderdashy/skipper/issues/36
    if(req._fileparser.form.bytesExpected > 10000000) {
      sails.log.error('File exceeds maxSize. Aborting.');
      req.connection.destroy();
      return res.end('File exceeds maxSize. Aborting.'); // This doesn't actually get sent, so you can skip this line.
    }

    req.file("file").upload(function (err, files) {
      if (err) {
        sails.log.error(err);
        return res.serverError(err);
      }

      // mkdir -p
      fs.mkdirs(TIMELINEFILEDIR, function(err){
        if (err) return res.serverError(err);
        else {

          var convertFileIterator = function (file, callback) {
            file.uploadedAs = path.basename(file.fd);
            file.savedTo = TIMELINEFILEDIR+"/"+file.uploadedAs;
            file.backupedTo = BACKUPTIMELINEFILEDIR+"/"+file.uploadedAs;

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
                    callback(null, file);
                  }
                });
              }
            });
          }

          async.map(files, convertFileIterator, function(err, files){
            var result = {
              message: files.length + ' file(s) uploaded successfully!',
              files: files
            };
            sails.log.debug(result);
            return res.json(result);
          });
        }
      });
    });
  }
}
