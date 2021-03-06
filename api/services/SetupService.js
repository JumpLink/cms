/**
 * The SetupService united functions to setup the CMS for the first use.
 */
var moment = require('moment');

/**
 * Delete all in model, prepair site for data, and insert data. 
 */
var replace = function (modelName, options, data, callback) {
  async.waterfall([
    function destroyAll(callback){
      sails.log.debug("[ExportImportService.importByHost.destroyAll]");
      global[modelName].destroy({site:options.site}, function (error, destroyed) {
        sails.log.debug(destroyed);
        callback(error);
      });
    },
    function prepair (callback){
      sails.log.debug("[ExportImportService.importByHost.prepair]");
      data = UtilityService.setPropertyForEach(data, 'site', options.site);
      callback(null, data);
    },
    function createNewSetup (data, callback){
      sails.log.debug("[ExportImportService.importByHost.createNewSetup]");
      async.map(data, global[modelName].create, callback);
    },
  ], callback);
};

var getThemeSetup = function (host, callback) {
  ThemeService.getTheme(host, function (err, theme) {
    if(err) return callback(err);
    sails.log.debug("[RoutesController.setup]", theme);
    if(UtilityService.isUndefined(theme) && UtilityService.isUndefined(theme.setup))
      return callback(new Error("[RoutesController.setup] Routes Setup is corrupt"));
    callback(null, theme.setup);
  });
};

/**
 * Get users for host setup.
 */
var users = function (host, callback) {
  getThemeSetup(host, function (err, setup) {
    if(err) sails.log.warn(err);
    if(UtilityService.isDefined(setup.users) && UtilityService.isArray(setup.users) && setup.users.length > 0)
      return callback(null, setup.users);
    if(UtilityService.isUndefined(sails.config.setup.fallback) || UtilityService.isUndefined(sails.config.setup.fallback.users) || !UtilityService.isArray(sails.config.setup.fallback.users) || sails.config.setup.fallback.users.length <= 0)
      return callback(new Error("[SetupService.users] No Setup for Users found"));
    sails.log.warn("[SetupService.users] Use Fallback Setup for Users");
    return callback(null, sails.config.setup.fallback.users);
  });
};

/**
 * Remove all existing users for host and insert new
 * WARN: This function removes all existing users for site and is adding just the default admin user with the default password.
 */
var generateUsers = function (host, callback) {
  var options = {};
  MultisiteService.getCurrentSiteConfig(host, function (err, siteConfig) {
    if(err) return callback(err);
    options.site = siteConfig.name;
    SetupService.users(host, function(err, users) {
      if(err) return callback(err);
      replace('User', options, users, callback);
    });
  });
};

/**
 * Get routes for host setup.
 */
var routes = function (host, callback) {
  getThemeSetup(host, function (err, setup) {
    if(err) sails.log.warn(err);
    if(UtilityService.isDefined(setup.routes) && UtilityService.isArray(setup.routes) && setup.routes.length > 0)
      return callback(null, setup.routes);
    sails.log.warn("[SetupService.routes] No Setup Routes for Theme found!", setup);
    if(UtilityService.isUndefined(sails.config.setup) || UtilityService.isUndefined(sails.config.setup.fallback) || UtilityService.isUndefined(sails.config.setup.fallback.routes) || !UtilityService.isArray(sails.config.setup.fallback.routes) || sails.config.setup.fallback.routes.length <= 0)
      return callback(new Error("[SetupService.routes] No Setup for Routes found"));
    sails.log.warn("[SetupService.routes] Use Fallback Setup for Routes");
    return callback(null, sails.config.setup.fallback.routes);
  });
};

/**
 * Remove all existing routes for host and insert new
 * WARN: This function removes all existing routes for site and is adding just the default admin route with the default password.
 */
var generateRoutes = function (host, callback) {
  var options = {};
  MultisiteService.getCurrentSiteConfig(host, function (err, siteConfig) {
    if(err) return callback(err);
    options.site = siteConfig.name;
    SetupService.routes(host, function(err, routes) {
      if(err) return callback(err);
      replace('Routes', options, routes, callback);
    });
  });
};

/**
 * Get content for host setup.
 */
var contents = function (host, callback) {
  getThemeSetup(host, function (err, setup) {
    if(err) sails.log.warn(err);
    if(UtilityService.isArray(setup.contents) && setup.contents.length > 0)
      return callback(null, setup.contents);
    sails.log.warn("[SetupService.contents] No Setup contents for Theme found!", setup);
    if(UtilityService.isUndefined(sails.config.setup) || UtilityService.isUndefined(sails.config.setup.fallback) || !UtilityService.isArray(sails.config.setup.fallback.contents) || sails.config.setup.fallback.contents.length <= 0)
      return callback(new Error("[SetupService.contents] No Setup for contents found"));
    sails.log.warn("[SetupService.contents] Use Fallback Setup for contents");
    return callback(null, sails.config.setup.fallback.contents);
  });
};

/**
 * Remove all existing content for host and insert new
 * WARN: This function removes all existing content for site and is adding just the default admin route with the default password.
 */
var generateContent = function (host, callback) {
  var options = {};
  MultisiteService.getCurrentSiteConfig(host, function (err, siteConfig) {
    if(err) return callback(err);
    options.site = siteConfig.name;
    SetupService.contents(host, function(err, contents) {
      if(err) return callback(err);
      replace('Content', options, contents, callback);
    });
  });
};

/**
 * Default members to setup example members for Member.
 */
var members = function (callback) {
  callback(null,
    [
      {position: 1, name:"Kapt. Ralf Gütlein", job: "Vorsitzender", image: 'photo.png'},
      {position: 2, name:"Dr. Hannes Ross", job: "stell. Vorsitzender", image: 'photo.png'},
      {position: 3, name:"Peter Fichtner", job: "stell. Vorsitzender", image: 'photo.png'},
      {position: 4, name:"Martin Schöne", job: "Schatzmeister", image: 'photo.png'},
      {position: 5, name:"Uwe Stolle", job: "Rechtskundiges Mitglied", image: 'photo.png'},
      {position: 6, name:"Burkhard Raasch", job: "Vorsitzender des Beirates", image: 'photo.png'},
      {position: 7, name:"Dr. Hannes Ross", job: "Reisen", image: 'photo.png'},
      {position: 8, name:"Peter Fichtner", job: "Ausbildung", image: 'photo.png'},
      {position: 9, name:"Kap. Dirk Homann", job: "Berufliche Kontakte", image: 'photo.png'},
      {position: 10, name:"Elke Timmermann", job: "Veranstaltungen", image: 'photo.png'},
      {position: 11, name:"Dr. Hans-Joachim Stietzel", job: "Kommunale Kontakte", image: 'photo.png'},
      {position: 12, name:"Erich Baumann", job: "Öffentlichkeitsarbeit", image: 'photo.png'},
      {position: 13, name:"Kapt. Wolfgang Gewiese", job: "Fischerei", image: 'photo.png'},
    ]
  );
};

/**
 * 
 */
var generateMembers = function (siteName, callback) {
  var options = {};
  MultisiteService.getCurrentSiteConfig(host, function (err, siteConfig) {
    if(err) return callback(err);
    options.site = siteConfig.name;
    SetupService.members(host, function(err, members) {
      if(err) return callback(err);
      replace('Member', options, members, callback);
    });
  });
};

/**
 * Timeline placeholder events for setup.
 */
var timeline = function (callback) {
  callback(null,
    [
      {
        type: 'lecture',
        person: 'Prof. Lange',
        title: 'Meeresverschmutzung und Auswirkung auf den Fisch',
        // from: 'Am 20.10.14 um 20:00 Uhr',
        from: moment('2014-10-20 20:00')._d,
        place: 'Captain Ahabs Culture Club Cuxhaven',
      },
      {
        type: 'lecture',
        person: 'Doktorandin Jenny Byl der Universität Rostock',
        title: 'Probleme durch Schall im Meer',
        // from: 'Am 17.11.14 um 20:00 Uhr',
        from: moment('2014-11-17 20:00')._d,
        place: 'Captain Ahabs Culture Club Cuxhaven',
      },
      {
        type: 'lecture',
        person: 'Pistol, Polizeidirektor a.D.',
        title: 'Ein Besuch auf Pitcairn',
        // from: 'Am 08.12.14 um 20:00 Uhr',
        from: moment('2014-12-08 20:00')._d,
        place: 'Captain Ahabs Culture Club Cuxhaven',
      },
      {
        type: 'lecture',
        person: 'P.Bussler',
        title: 'Cuxhavener Gastronomie im Hafen im 19.Jahrhundert',
        // from: 'Am 19.01.19 um 20:00 Uhr',
        from: moment('2015-01-19 20:00')._d,
        place: 'Captain Ahabs Culture Club Cuxhaven',
      },
      {
        type: 'panel discussion',
        title: 'Podiumsdiskussion - Situation der Deutschen Schifffahrt und Beschäftigungssituation Deutscher Seeleute',
        // from: 'Am 16.02.15 um 20:00 Uhr',
        from: moment('2015-02-16 20:00')._d,
        place: 'Captain Ahabs Culture Club Cuxhaven',
      },
      {
        type: 'travel',
        title: 'Ostseereise nach Polen, Russland (Königsberg und Pillau), Litauen.',
        // from: 'AVom 03.6.15 bis 11.6.15',
        from: moment('2015-06-03')._d,
        to: moment('2015-06-15')._d,
        download: 'Ostseereise%203.6.-11.6.15.pdf',
      },
    ]
  );
};

/**
 * @see https://github.com/caolan/async#waterfall 
 * @see https://github.com/caolan/async#map
 */
var generateTimeline = function (siteName, callback) {
  var options = {};
  MultisiteService.getCurrentSiteConfig(host, function (err, siteConfig) {
    if(err) return callback(err);
    options.site = siteConfig.name;
    SetupService.timeline(host, function(err, timeline) {
      if(err) return callback(err);
      replace('Timeline', options, timeline, callback);
    });
  });
};

/**
 * 
 */
var generateAll = function (siteName, callback) {

  var getKeys = function (obj) {
    var keys = [];
    for(var k in obj) keys.push(k);
      return keys;
  };

  var controllers = getKeys(sails.controllers);
  sails.log.info("sails.controllers", controllers);

  // TODO siteName
  async.series([
    SetupService.generateUsers,
    SetupService.generateMembers,
    SetupService.generateTimeline,
  ], callback);
};

/**
 * 
 */
module.exports = {
  getThemeSetup: getThemeSetup,
  users: users,
  generateUsers: generateUsers,
  routes: routes,
  generateRoutes: generateRoutes,
  contents: contents,
  generateContent: generateContent,
  members: members,
  generateMembers: generateMembers,
  timeline: timeline,
  generateTimeline: generateTimeline,
  generateAll: generateAll
};
