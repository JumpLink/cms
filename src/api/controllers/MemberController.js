module.exports = {
  setup: function (req, res, next) {
    async.waterfall([
      function destroyAll(callback){
        sails.log.debug("destroyAll");
        Member.destroy({}, function (error, destroyed) {
          sails.log.debug(destroyed);
          callback(error);
        });
      },
      function getNewSetup (callback){
        sails.log.debug("getNewSetup Member");
        SetupService.members(callback);
      },
      function createNewSetup (newValues, callback){
        sails.log.debug("createNewSetup");
        // https://github.com/caolan/async#map
        async.map(newValues, Member.create, callback);
      },
    ], function (err, result) {
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
}
