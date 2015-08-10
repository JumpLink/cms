/**
 * The SetupService united functions to setup the CMS for the first use.
 */
var moment = require('moment');

var getThemeSetup = function (host, cb) {
  ThemeService.getTheme(host, function (err, theme) {
    if(err) return cb(err);
    sails.log.debug("[RoutesController.setup]", theme);
    if(UtilityService.isUndefined(theme) && UtilityService.isUndefined(theme.setup))
      return cb(new Error("[RoutesController.setup] Routes Setup is corrupt"));
    cb(null, theme.setup)
  });
}

/**
 * Get users for host setup.
 */
var users = function (host, cb) {
  getThemeSetup(host, function (err, setup) {
    if(err) sails.log.warn(err);
    if(UtilityService.isDefined(setup.users) && UtilityService.isArray(setup.users) && setup.users.length > 0)
      return cb(null, setup.users);
    if(UtilityService.isUndefined(sails.config.setup.fallback) || UtilityService.isUndefined(sails.config.setup.fallback.users) || !UtilityService.isArray(sails.config.setup.fallback.users) || sails.config.setup.fallback.users.length <= 0)
      return cb(new Error("[SetupService.users] No Setup for Users found"));
    sails.log.warn("[SetupService.users] Use Fallback Setup for Users");
    return cb(null, sails.config.setup.fallback.users);
  });
};

/**
 * Remove all existing users for host and insert new
 * WARN: This function removes all existing users for site and is adding just the default admin user with the default password.
 */
var generateUsers = function (host, cb) {
  MultisiteService.getCurrentSiteConfig(host, function (err, siteConfig) {
    if(err) return cb(err);
    async.waterfall([
      function destroyAll(callback){
        sails.log.debug("destroyAll");
        User.destroy({site:siteConfig.name}, function (error, destroyed) {
          sails.log.debug(destroyed);
          callback(error);
        });
      },
      function getNewSetup (callback){
        sails.log.debug("getNewSetup");
        SetupService.users(host, function(err, users) {
          if(err) return callback(err);
          users = UtilityService.setPropertyForEach(users, 'site', siteConfig.name);
          callback(null, users);
        });
      },
      function createNewSetup (newUsers, callback){
        sails.log.debug("createNewSetup");
        //User.create(newUsers[0], callback);
        async.map(newUsers, User.create, callback);
      },
    ], cb);
  });
};

/**
 * Get routes for host setup.
 */
var routes = function (host, cb) {
  getThemeSetup(host, function (err, setup) {
    if(err) sails.log.warn(err);
    if(UtilityService.isDefined(setup.routes) && UtilityService.isArray(setup.routes) && setup.routes.length > 0)
      return cb(null, setup.routes);
    sails.log.warn("[SetupService.routes] No Setup Routes for Theme found!", setup);
    if(UtilityService.isUndefined(sails.config.setup) || UtilityService.isUndefined(sails.config.setup.fallback) || UtilityService.isUndefined(sails.config.setup.fallback.routes) || !UtilityService.isArray(sails.config.setup.fallback.routes) || sails.config.setup.fallback.routes.length <= 0)
      return cb(new Error("[SetupService.routes] No Setup for Routes found"));
    sails.log.warn("[SetupService.routes] Use Fallback Setup for Routes");
    return cb(null, sails.config.setup.fallback.routes);
  });
};

/**
 * Remove all existing routes for host and insert new
 * WARN: This function removes all existing routes for site and is adding just the default admin route with the default password.
 */
var generateRoutes = function (host, cb) {
  MultisiteService.getCurrentSiteConfig(host, function (err, siteConfig) {
    if(err) return cb(err);
    async.waterfall([
      function destroyAll(callback){
        sails.log.debug("[SetupService.generateRoutes.destroyAll] destroyAll");
        Routes.destroy({site:siteConfig.name}, function (error, destroyed) {
          sails.log.debug(destroyed);
          callback(error);
        });
      },
      function getNewSetup (callback){
        sails.log.debug("getNewSetup");
        SetupService.routes(host, function(err, routes) {
          if(err) return callback(err);
          routes = UtilityService.setPropertyForEach(routes, 'site', siteConfig.name);
          callback(null, routes);
        });
      },
      function createNewSetup (newRoutes, callback){
        sails.log.debug("[SetupService.generateRoutes.createNewSetup] createNewSetup");
        //User.create(newRoutes[0], callback);
        async.map(newRoutes, Routes.create, callback);
      },
    ], cb);
  });
};

/**
 * Default members to setup example members for Member.
 */
var members = function (cb) {
  cb(null,
    [
      {position: 1, name:"Kapt. Ralf Gütlein", job: "Vorsitzender", image: 'photo.png'}
      , {position: 2, name:"Dr. Hannes Ross", job: "stell. Vorsitzender", image: 'photo.png'}
      , {position: 3, name:"Peter Fichtner", job: "stell. Vorsitzender", image: 'photo.png'}
      , {position: 4, name:"Martin Schöne", job: "Schatzmeister", image: 'photo.png'}
      , {position: 5, name:"Uwe Stolle", job: "Rechtskundiges Mitglied", image: 'photo.png'}
      , {position: 6, name:"Burkhard Raasch", job: "Vorsitzender des Beirates", image: 'photo.png'}
      , {position: 7, name:"Dr. Hannes Ross", job: "Reisen", image: 'photo.png'}
      , {position: 8, name:"Peter Fichtner", job: "Ausbildung", image: 'photo.png'}
      , {position: 9, name:"Kap. Dirk Homann", job: "Berufliche Kontakte", image: 'photo.png'}
      , {position: 10, name:"Elke Timmermann", job: "Veranstaltungen", image: 'photo.png'}
      , {position: 11, name:"Dr. Hans-Joachim Stietzel", job: "Kommunale Kontakte", image: 'photo.png'}
      , {position: 12, name:"Erich Baumann", job: "Öffentlichkeitsarbeit", image: 'photo.png'}
      , {position: 13, name:"Kapt. Wolfgang Gewiese", job: "Fischerei", image: 'photo.png'}
    ]
  );
};

/**
 * 
 */
var generateMembers = function (siteName, cb) {
  async.waterfall([
    function destroyAll(callback) {
      sails.log.debug("destroyAll");
      Member.destroy({site:siteName}, function (error, destroyed) {
        sails.log.debug(destroyed);
        callback(error);
      });
    },
    function getNewSetup (callback){
      sails.log.debug("getNewSetup Member");
      SetupService.members(function (error, newMembers) {
        if(error) return callback(error);
        newMembers = UtilityService.setPropertyForEach(newMembers, 'site', siteName);
        callback(error, newMembers);
      });
    },
    function createNewSetup (newMembers, callback) {
      sails.log.debug("createNewSetup");
      // sails.log.debug("newMembers", newMembers);
      // sails.log.debug("callback", callback);
      // https://github.com/caolan/async#map
      async.map(newMembers, Member.create, callback);
    },
  ], cb);
};

/**
 * Timeline placeholder events for setup.
 */
var timeline = function (cb) {
  cb(null,
    [
        {
            type: 'lecture'
          , person: 'Prof. Lange'
          , title: 'Meeresverschmutzung und Auswirkung auf den Fisch'
          // , from: 'Am 20.10.14 um 20:00 Uhr'
          , from: moment('2014-10-20 20:00')['_d']
          , place: 'Captain Ahabs Culture Club Cuxhaven'
        }
      , {
            type: 'lecture'
          , person: 'Doktorandin Jenny Byl der Universität Rostock'
          , title: 'Probleme durch Schall im Meer'
          // , from: 'Am 17.11.14 um 20:00 Uhr'
          , from: moment('2014-11-17 20:00')['_d']
          , place: 'Captain Ahabs Culture Club Cuxhaven'
        }
      , {
            type: 'lecture'
          , person: 'Pistol, Polizeidirektor a.D.'
          , title: 'Ein Besuch auf Pitcairn'
          // , from: 'Am 08.12.14 um 20:00 Uhr'
          , from: moment('2014-12-08 20:00')['_d']
          , place: 'Captain Ahabs Culture Club Cuxhaven'
        }
      , {
            type: 'lecture'
          , person: 'P.Bussler'
          , title: 'Cuxhavener Gastronomie im Hafen im 19.Jahrhundert'
          // , from: 'Am 19.01.19 um 20:00 Uhr'
          , from: moment('2015-01-19 20:00')['_d']
          , place: 'Captain Ahabs Culture Club Cuxhaven'
        }
      , {
            type: 'panel discussion'
          , title: 'Podiumsdiskussion - Situation der Deutschen Schifffahrt und Beschäftigungssituation Deutscher Seeleute'
          // , from: 'Am 16.02.15 um 20:00 Uhr'
          , from: moment('2015-02-16 20:00')['_d']
          , place: 'Captain Ahabs Culture Club Cuxhaven'
        }
      , {
            type: 'travel'
          , title: 'Ostseereise nach Polen, Russland (Königsberg und Pillau), Litauen.'
          // , from: 'AVom 03.6.15 bis 11.6.15'
          , from: moment('2015-06-03')['_d']
          , to: moment('2015-06-15')['_d']
          , download: 'Ostseereise%203.6.-11.6.15.pdf'
        }
    ]
  );
};

/**
 * @see https://github.com/caolan/async#waterfall 
 * @see https://github.com/caolan/async#map
 */
var generateTimeline = function (siteName, cb) {
  async.waterfall([
    function destroyAll(callback){
      sails.log.debug("destroyAll");
      Timeline.destroy({site:siteName}, function (error, destroyed) {
        sails.log.debug(destroyed);
        callback(error);
      });
    },
    function getNewSetup (callback){
      sails.log.debug("getNewSetup Timeline");
      SetupService.timeline(function (err, events) {
        if(err) return callback(err);
        events = UtilityService.setPropertyForEach(events, 'site', siteName);
        callback(null, events);
      });
    },
    function createNewSetup (newValues, callback){
      sails.log.debug("createNewSetup");
      async.map(newValues, Timeline.create, callback);
    },
  ], cb);
};

/**
 * 
 */
var generateAll = function (siteName, cb) {

  var getKeys = function (obj) {
    var keys = [];
    for(var k in obj) keys.push(k);
      return keys;
  }

  var controllers = getKeys(sails.controllers);
  sails.log.info("sails.controllers", controllers);

  // TODO siteName
  async.series([
    SetupService.generateUsers,
    SetupService.generateMembers,
    SetupService.generateTimeline,
  ], cb);
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
  members: members,
  generateMembers: generateMembers,
  timeline: timeline,
  generateTimeline: generateTimeline,
  generateAll: generateAll
};
