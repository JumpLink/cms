/**
 * ViewController
 *
 * @description :: Server-side logic for managing views
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var updateBrowser = function (req, res, next) {
  res.view('bootstrap/templates/legacy/browser', { useragent: req.useragent, title: 'Ihr Browser wird nicht unterstützt' });
}

var legacy = function (req, res, next) {
  var about, goals;
  Content.find({name:'about'}).exec(function found(err, results) {
    about = results[0].content;
    Content.find({name:'goals'}).exec(function found(err, results) {
      goals = results[0].content;
      res.view('bootstrap/templates/home/legacy/content', { about: about, goals: goals, useragent: req.useragent, title: 'Nautischer Verein Cuxhaven e.V. - Startseite' });
    });
  });
}

module.exports = {
  updateBrowser: updateBrowser,
  legacy: legacy,
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
      // TODO fix user
      var user = "{}";
      if(typeof req.session.user != 'undefined') user = JSON.stringify(req.session.user);
      res.view('bootstrap/init', { authenticated: req.session.authenticated === true, user: user});
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
      res.view('bootstrap/templates/legacy/signin', { flash: req.session.flash });
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

