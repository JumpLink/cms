module.exports = {
  
  setup: function(req, res) {
    res.ok();
  },

  all: function (req, res, next) {
    SetupService.generateAll(function(err, result) {
      sails.log.info("SetupService: generateAll - done");
      if(err)
        res.json(err);
      else
        res.json(result);
    });
  }

  , _config: {}


};
