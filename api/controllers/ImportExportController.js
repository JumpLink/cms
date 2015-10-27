var path = require('path'); 

/**
 * 
 */
var upload = function (req, res) {
  sails.log.debug("[ImportExportController.upload]", req);
  req.file("import").upload(function (err, files) {
    if (err) {
      sails.log.error(err);
      return res.serverError(err);
    }

    for (var i = 0; i < files.length; i++) {
      files[i].uploadedAs = path.basename(files[i].fd);
      files[i].data = require(files[i].fd);
      sails.log.debug("[ImportExportController.upload] files", files[i]);
    }

    return res.json({
      message: files.length + ' file(s) uploaded successfully!',
      files: files
    });
  });
};

/**
 * Public API functions
 */
module.exports = {
  upload: upload,
};
