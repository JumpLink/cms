/**
 * ContentController
 *
 * @module Controller
 * A set of functions called `actions`.
 *
 * Actions contain code telling Sails how to respond to a certain type of request.
 * (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 * You can configure the blueprint URLs which trjauigger these actions (`config/controllers.js`)
 * and/or override them with custom routes (`config/routes.js`)
 *
 * NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @see http://sailsjs.org/documentation/concepts/controllers
 */

/**
 * 
 */
var setup = function(req, res) {
  res.ok();
};

/**
 * 
 */
var replaceAll = function (req, res, next) {
  MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, conf) {
    if(err) { return res.serverError(err); }
    var site = conf.name;
    var page = req.param('page');
    var datas = req.param('contents');

    for (var i = 0; i < datas.length; i++) {
      datas[i].site = site;
      datas[i].page = page;
    };

    var queryParams = ['page', 'site', 'name'];

    if(req.param('type')) {
      queryParams.push('type');
    }

    sails.log.debug("ContentController.js:replaceAll", datas);

    ModelService.updateOrCreateEach('Content', datas, ['page', 'site', 'name'], function (err, result) {
      if (err) {
        sails.log.error("ContentController: Error on updateOrCreateEach:", err);
        return res.serverError(err);
      } else {
        sails.log.info("Content "+req.param('page')+" saved");

        // TODO TESTME
        for (var i = result.length - 1; i >= 0; i--) {
          Member.publishUpdate(result[i].id, result[i]);
        };
        
        res.status(201);
        return res.json(result);
       }
    });
  });
};

/**
 * 
 */
var replace = function (req, res, next) {
  MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, conf) {
    if(err) { return res.serverError(err); }
    var query = {
      where: {
        name: req.param('name'),
        page: req.param('page'),
        site: conf.name
      }
    };

    if(req.param('type')) {
      query.where.type = req.param('type');
    }

    var data = req.params.all();
    delete data.id;
    data.site = conf.name;

    sails.log.debug("ContentController.js:replace", data);
    
    ModelService.updateOrCreate('Content', data, query, function (err, result) {
      if (err) {
        sails.log.error(err);
        return res.serverError(err);
      } else {
        sails.log.info("content "+req.param('name')+" saved");
        res.status(201);
        return res.json(result);
       }
    });
  });
};

/**
 * Usually used for pages where you can add and remove new content blocks (get sll content blocks by page).
 */
var findAll = function (req, res) {
  var query;
  MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, conf) {
    if(err) { return res.serverError(err); }
    query = {
      where: {
        page: req.param('page'),
        site: conf.name
      },
      sort: 'position'
    };

    if(req.param('type')) {
      query.where.type = req.param('type');
    }

    // sails.log.debug("query", query)
    Content.find(query).exec(function found (err, contents) {
      if (err) return res.serverError(err);
      // TODO maybe remove this and make shure the positions are okay on client site
      contents = UtilityService.fixPosition(contents);
      res.json(contents);
    });
  });
};

/**
 * 
 */
var findAllWithImage = function (req, res) {

  var page = req.param('page');
  var type = req.param('type');

  // var query;
  MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, conf) {
    if(err) { return res.serverError(err); }
    var site = conf.name;
    ContentService.resolveAllWithImage(page, site, type, function (err, data) {
      if(err) { return res.serverError(err); }
      res.json({contents:data.contents, images:data.images});
    });
  });
};

/**
 * Usually used for pages with fixed content blocks (get one content block by name).
 */
var find = function (req, res) {
  var query;
  MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, conf) {
    if(err) { return res.serverError(err); }
    query = {
      where: {
        name: req.param('name'),
        page: req.param('page'),
        site: conf.name
      }
    };

    if(req.param('type')) {
      query.where.type = req.param('type');
    }

    // sails.log.debug("query", query)
    Content.findOne(query).exec(function found (err, content) {
      if (err) return res.serverError(err);
      if (content instanceof Array) content = content[0];

      // not found
      if (UtilityService.isUndefined(content) || UtilityService.isUndefined(content.id) || content.id === null) {
        res.notFound(query.where);
      } else {
        // sails.log.debug("found", found);
        res.json(content);
      }
    });
  });
};

/**
 * 
 */
var destroy = function(req, res) {
  MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, conf) {
    query = {
      where: {
        page: req.param('page'),
        site: conf.name
      }
    };

    var id = req.param('id');
    if(id) {
      query.where.id = id;
    }

    var name = req.param('name');
    if(name) {
      query.where.name = name;
    }
    
    var type = req.param('type');
    if(type) {
      query.where.type = type;
    }

    // sails.log.debug"destroy content", query);
    Content.findOne(query).exec(function found(err, content) {
      if (err) return res.serverError(err);
      if (typeof(content) === 'undefined') return res.notFound();
      Content.destroy({id:content.id, site:conf.name}, function (err, destroyed) {
        Content.publishDestroy(content.id);
        if(err) return res.serverError(err);
        sails.log.info(destroyed, content);
        res.ok();
      });
    });
  });
};

/**
 * 
 */
var exporting = function (req, res) {
  MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, conf) {
    if(err) { return res.serverError(err); }
    var query = { where: { site: conf.name }};
    Content.find(query).exec(function found(err, found) {
      if (err) return res.serverError(err);
      if (UtilityService.isUndefined(found) || !found instanceof Array) { res.notFound(query.where); }
      else { res.json(found); }
    });
  });
};

/**
 * 
 */
module.exports = {
  setup:setup,
  replaceAll:replaceAll,
  replace:replace,
  findAll:findAll,
  findAllWithImage:findAllWithImage,
  find:find,
  destroy:destroy,
  exporting:exporting
};
