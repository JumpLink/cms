/**
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

  /**
   * Get a list of found Themes 
   */
  available: function (req, res, next) {
    ThemeService.getAvailableThemes(function (dirs) {
      // sails.log.debug(dirs);
      res.json(dirs);
    });
  }
  , infos: function (req, res, next) {
    ThemeService.getThemes(function (err, themes) {
      if(err) sails.log.error(err);
      // sails.log.debug(themes);
      res.json(themes);
    });
  }
  
  , settings: function (req, res, next) {
    ThemeService.getThemes(function (err, themes) {
      res.json({available: themes, selected: 'bootstrap'});
    });
    
  }

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to ContentController)
   */
  , _config: {}
};
