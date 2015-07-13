module.exports = {

  setup: function(req, res) {
    res.ok();
  },

  /*
   * Information about the CMS for normal visitors / users.
   */
  infoUser: function(req, res) {
    CmsService.infoUser(function (error, result) {
      sails.log.debug(result);
      res.json(result);
    });
  },

  /*
   * Info about CMS only for super admins.
   */
  infoAdmin: function(req, res) {
    CmsService.infoAdmin(function (error, result) {
      sails.log.debug(result);
      res.json(result);
    });
  }

};
