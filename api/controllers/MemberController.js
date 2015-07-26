/**
 * The Member Controller
 */

/**
 * 
 */
var setup = function (req, res, next) {
  MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, config) {
    SetupService.generateMembers(config.name, unction(err, result) {
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
    Member.create(data).exec(function create(err, created) {
      // Member.publisCreate(created[0].id, created[0]);
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
    var data = req.params.all();
    data.site = config.name;
    var id = data.id || req.param('id');
    Member.update({id:id, site: data.site}, data).exec(function update(err, updated) {
      // Member.publishUpdate(updated[0].id, updated[0]);
      sails.log.info("updated", updated);
      res.json(updated);
    });
  });
};

/**
 * 
 */
var upload = function (req, res) {
  thumbnailOptions = {width: 280, path: sails.config.paths.members};
  FileService.upload(req, sails.config.paths.members, thumbnailOptions, function (err, result) {
    if(err) return res.serverError(err);
    else res.json(result);
  });
};

/**
 * 
 */
var find = function (req, res) {
  var query;

  MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, config) {
    if(err) { return res.serverError(err); }

    query = {
      where: {
        site: config.name
      }
    };

    Member.find(query).exec(function found(err, found) {
      // error
      if (err) return res.serverError(err);
      // not found
      if (UtilityService.isUndefined(found) || !UtilityService.isArray(found)) return res.notFound(query.where);
      // else
      res.json(found);
    });
  });
};

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
