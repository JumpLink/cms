/**
 * ViewController
 *
 * @description :: Server-side logic for managing views
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

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
    res.view('init-bootstrap', { authenticated: req.session.authenticated === true });
  },

  /*
   * legacy html page to allow browser to auto-fill e-mail and password
   */
  signin: function(req, res, next) {
    res.view('signin', { flash: req.session.flash });
  }
};

