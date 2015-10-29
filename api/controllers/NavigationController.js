/**
 * 
 *
 * @module NavigationController
 */

/**
 * 
 * @param {!object} req - Request
 * @param {!object} res - responses
 * @param {function} next
 */
var setup = function(req, res, next) {
  res.ok();
};

/**
 * 
 * @param {!object} req - Request
 * @param {!object} res - responses
 * @param {function} next
 */
var replaceAll = function (req, res, next) {
  MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, config) {
    if(err) { return res.serverError(err); }
    var site = config.name;
    var page = req.param('page');
    var datas = req.param('navs');

    for (var i = 0; i < datas.length; i++) {
      datas[i].site = site;
      datas[i].page = page;
    };

    ModelService.updateOrCreateEach('Navigation', datas, ['page', 'site', 'target'], function (err, result) {
      if (err) {
        sails.log.error(err);
        return res.serverError(err);
      } else {
        sails.log.debug("NavigationController: Save", result);
        sails.log.info("Navigation "+req.param('page')+" saved");
        res.status(201);
        return res.json(result);
       }
    });
  });
};

/**
 * 
 * @param {!object} req - Request
 * @param {!object} res - responses
 * @param {function} next
 */
var replace = function (req, res, next) {
  MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, config) {
    if(err) { return res.serverError(err); }
    var query = {
      where: {
        page: req.param('page'),
        site: config.name,
        target: req.param('target')
      }
    };
    var data = req.params.all();
    delete data.id;
    data.site = config.name;
    sails.log.debug("NavigationController: Try to save", data);
    ModelService.updateOrCreate('Navigation', data, query, function (err, result) {
      if (err) {
        sails.log.error(err);
        return res.serverError(err);
      } else {
        sails.log.debug("NavigationController: Save", data);
        sails.log.info("Navigation "+req.param('page')+" saved");
        res.status(201);
        return res.json(result);
       }
    });
  });
};

/**
 * 
 * @param {!object} req - Request
 * @param {!object} res - responses
 * @param {function} next
 */
var find = function (req, res, next) {
  var query;
  MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, config) {
    if(err) { return res.serverError(err); }
    query = {
      where: {
        page: req.param('page'),
        site: config.name
      },
      sort: 'position'
    };
    // sails.log.debug("query", query)
    Navigation.find(query).exec(function found(err, navs) {
      if (err || UtilityService.isUndefined(navs) || !navs instanceof Array) return res.serverError({error:err, query:query});
      navs = UtilityService.fixPosition(navs);
      res.json(navs);
    });
  });
};

/**
 * 
 * @param {!object} req - Request
 * @param {!object} res - responses
 * @param {function} next
 */
var exporting = function (req, res, next) {
  MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, config) {
    if(err) { return res.serverError(err); }
    var query = { where: { site: config.name }};
    Navigation.find(query).exec(function found(err, navs) {
      if (err) return res.serverError(err);
      if (UtilityService.isUndefined(navs) || !navs instanceof Array) { res.notFound(query.where); }
      else { res.json(navs); }
    });
  });
};

/**
 * Public API functions
 */
module.exports = {
  setup:setup,
  replaceAll:replaceAll,
  replace:replace,
  find:find,
  exporting:exporting
};
