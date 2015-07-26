/**
 * 
 */
var path = require('path');
var fs = require('fs-extra'); // Node.js: extra methods for the fs object: https://github.com/jprichardson/node-fs-extra
var UPLOADFOLDER =  path.normalize(__dirname+'/../../.tmp/uploads');
var TIMELINEFILEDIR = path.normalize(__dirname+'/../../.tmp/public/files/timeline');
var BACKUPTIMELINEFILEDIR = path.normalize(__dirname+'/../../assets/files/timeline');

/**
 * 
 */
var setup = function (req, res, next) {
  MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, config) {
    SetupService.generateTimeline(config.name, function(err, result) {
      if(err) { return res.serverError(err); }
      res.json(result);
    });
  });
};

/**
 * 
 */
var create = function (req, res, next) {
  MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, config) {
    if(err) { return res.serverError(err); }
    var data = req.params.all();
    data.site = config.name;
    Timeline.create(data).exec(function create(err, created){
      // Timeline.publisCreate(created[0].id, created[0]);
      sails.log.info("created", created);
      res.json(created);
    });
  });
};

/**
 * 
 */
var update = function (req, res, next) {
  MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, config) {
    if(err) { return res.serverError(err); }
    var id = req.param('id');
    var data = req.params.all();
    data.site = config.name;
    Timeline.update({id:id, site:config.name},data).exec(function update(err, updated){
      // Timeline.publishUpdate(updated[0].id, updated[0]);
      sails.log.info("updated", updated);
      res.json(updated);
    });
  });
};

/**
 * 
 */
var upload = function (req, res) {
  FileService.upload(req, sails.config.paths.timeline, null, function (err, result) {
    if(err) return res.serverError(err);
    else res.json(result);
  });
};

/**
 * 
 */
var find = function (req, res) {
  MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, config) {
    if(err) { return res.serverError(err); }
    var query = {
      where: {
        site: config.name
      }
    };

    Timeline.find(query).exec(function found(err, found) {
      if (err) return res.serverError(err);
      // not found
      if (UtilityService.isUndefined(found) || !UtilityService.isArray(found)) {
        res.notFound(query.where);
      } else {
        // sails.log.debug("found", found);
        res.json(found);
      }
    });
  });
}

/**
 * 
 */
module.exports = {
  setup:setup,
  create:create,
  update:update,
  upload:upload,
  find:find
}
