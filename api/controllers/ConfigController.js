module.exports = {
  
  setup: function(req, res) {
    res.ok();
  },

  find: function (req, res, next) {
    res.json({
      'paths': sails.config.paths
    });
  }
};
