/**
 * ViewController
 *
 * @description :: Server-side logic for managing views
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var updateBrowser = function (req, res, next) {
  res.view('bootstrap/legacy/browser', { useragent: req.useragent });
}

module.exports = {
  /*
   * single-page application https://en.wikipedia.org/wiki/Single-page_application
   */
	singlePageIonic: function(req, res, next) {
    res.view('init-ionic');
  },

  singlePageMaterial: function(req, res, next) {
    res.view('init-material');
  },

  singlePageBootstrap: function(req, res, next) {

    var ok = function (req, res, next) {
      res.view('bootstrap/init', { authenticated: req.session.authenticated === true });
    }

    // TODO
    var legacy = function () {

    }

    if(UseragentService.supported(req)) {
      ok(req, res, next);
    } else {
      updateBrowser(req, res, next);
    }

  },

  /*
   * legacy html page to allow browser to auto-fill e-mail and password
   */
  signin: function(req, res, next) {

    var ok = function () {
      res.view('bootstrap/legacy/signin', { flash: req.session.flash });
    }

    // TODO
    var legacy = function () {

    }

    if(UseragentService.supported(req)) {
      ok();
    } else {
      updateBrowser(req, res, next);
    }

  }
};

