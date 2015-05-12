var path = require('path');
var fs = require('fs-extra'); // Node.js: extra methods for the fs object: https://github.com/jprichardson/node-fs-extra
var MEMBER_FILE_DIR = path.resolve(sails.config.paths.public, 'assets/images/members');

module.exports = {
  setup: function (req, res, next) {
    SetupService.generateMembers(function(err, result) {
      sails.log.debug("done");
      if(err)
        res.json(err);
      else
        res.json(result);
    });
  }

  , update: function (req, res, next) {
    var id = req.param('id');
    var data = req.params.all();
    Member.update({id:id},data).exec(function update(err,updated){
      Member.publishUpdate(updated[0].id, updated[0]);
      res.json(updated);
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
      fs.mkdirs(MEMBER_FILE_DIR, function(err){
        if (err) return res.serverError(err);
        else {
          async.map(files, MemberService.convertFileIterator, function(err, files){
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
