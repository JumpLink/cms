/**
 * DocumentController
 *
 * @description :: Server-side logic for managing documents
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var path = require('path');

module.exports = {

  setup: function(req, res) {
    GalleryService.generateThumbnailsFromFilesystem(function(error, message) {
      if(error) return res.json(error);
      async.waterfall([
        function destroyAll(callback){
          sails.log.debug("destroyAll");
          Gallery.destroy({}, function (error, destroyed) {
            sails.log.debug(destroyed);
            callback(error);
          });
        },
        function getNewSetup (callback){
          GalleryService.getFilesFromFilesystem(callback);
        },
        function createNewSetup (newValues, callback){
          sails.log.debug("createNewSetup");
          // https://github.com/caolan/async#map
          async.map(newValues, Gallery.create, callback);
        },
      ], function (err, result) {
        sails.log.debug("done");
        if(err) return res.json(err);
        else res.json(result);
      });
    });
  },
  
  upload: function (req, res) {
    sails.log.debug(req.file);

    // WORKAROUND for BUG https://github.com/balderdashy/skipper/issues/36
    if(req._fileparser.form.bytesExpected > 10000000) {
      sails.log.error('File exceeds maxSize. Aborting.');
      req.connection.destroy();
      return res.end('File exceeds maxSize. Aborting.'); // This doesn't actually get sent, so you can skip this line.
    }

    req.file("file").upload(function (error, files) {
      if (error) {
        sails.log.error(error);
        return res.serverError(error);
      } else {
        GalleryService.saveFilesFromUpload(files, function (error, files) {
          if(error) return res.serverError(error);
          sails.log.debug(files);
          Gallery.create(files, function(error, files) {
            if(error) return res.serverError(error);
            var result = {
              message: files.length + ' file(s) uploaded successfully!',
              files: files
            };
            files.forEach(function(file, index) {
              console.log("Gallery.publishCreate(file);", file, index, files.length);
              Gallery.publishCreate(file);
            });
            sails.log.debug(result);
            res.json(result);
          });
        });
      }
    });
  },

  update: function (req, res, next) {
    var id = req.param('id');
    var data = req.params.all();
    Gallery.update({id:id},data).exec(function update(err,updated){
      Gallery.publishUpdate(updated[0].id, updated[0]);
      res.json(updated);
    });
  },

  destroy: function(req, res) {
    var id = req.param('id');
    var filename = req.param('filename');
    console.log("delete image", id, filename);
    GalleryService.removeFromFilesystem(filename, true, function(error) {
      if(error) return res.serverError(error);
      Gallery.destroy(id, function (error, destroyed) {
        Gallery.publishDestroy(id);
        if(error) return res.serverError(error);
        sails.log.debug(destroyed);
        res.ok();
      });
    });
  }

};
