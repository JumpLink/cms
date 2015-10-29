/**
 * VWHeritageController
 *
 * @description :: Server-side logic for managing vw heritage api
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

/**
 * 
 */
var catalog_product_list = function (req, res, next) {

  sails.log.debug("[VWHeritageController]", "vwheritage/catalog_product_list");

  MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, config) {
    if(err) { sails.log.error(err); return res.serverError(err); }
    var vwheritage = require('heritage')(config.vwheritage);
    vwheritage.auto.catalog.product.list(function (err, result) {
      if(err) { sails.log.error(err); return res.serverError(err); }
      // sails.log.debug(result);
      res.json(result);
    });
  });
};

/**
 * 
 */
var catalog_product_info = function (req, res, next) {

  sails.log.debug("[VWHeritageController]", "vwheritage/catalog_product_info");

  MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, config) {
    if(err) { sails.log.error(err); return res.serverError(err); }
    var vwheritage = require('heritage')(config.vwheritage);
    var id = req.param('id'); // can also be the id

    if(err) { sails.log.error(err); return res.serverError(err); }
    vwheritage.auto.catalog.product.infoById(id, function (err, result) {
      if(err) { sails.log.error(err); return res.serverError(err); }
      // sails.log.debug(result);
      res.json(result);
    });
  });
};

/**
 * 
 */
var catalog_product_images = function (req, res, next) {

  sails.log.debug("[VWHeritageController]", "vwheritage/catalog_product_images");

  MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, config) {
    if(err) { sails.log.error(err); return res.serverError(err); }
    var vwheritage = require('heritage')(config.vwheritage);
    var id = req.param('id');

    sails.log.debug("[VWHeritageController]", "id", id);

    if(err) { sails.log.error(err); return res.serverError(err); }
    vwheritage.auto.catalog.product.images(id, function (err, result) {
      if(err) { sails.log.error("[VWHeritageController]", err); return res.serverError(err); }
      // sails.log.debug("[VWHeritageController]", result);
      res.json(result);
    });
  });
};

/**
 * 
 */
var catalog_product_infos = function (req, res, next) {

  sails.log.debug("[VWHeritageController]", "vwheritage/catalog_product_infos");

  MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, config) {
    if(err) { sails.log.error(err); return res.serverError(err); }
    var vwheritage = require('heritage')(config.vwheritage);
    var skus = req.param('skus');

    if(err) { sails.log.error(err); return res.serverError(err); }
    vwheritage.auto.catalog.product.info(skus, function (err, result) {
      if(err) { sails.log.error(err); return res.serverError(err); }
      // sails.log.debug(result);
      res.json(result);
    });
  });
};

/**
 * 
 */
module.exports = {
  catalog_product_list: catalog_product_list,
  catalog_product_info: catalog_product_info,
  catalog_product_images: catalog_product_images,
  catalog_product_infos: catalog_product_infos,
};

