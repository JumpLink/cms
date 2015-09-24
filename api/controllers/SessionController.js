/**
 * SessionController
 * Server-side logic for managing sessions.
 * @see http://links.sailsjs.org/docs/controllers
 * @see https://github.com/shaneGirish/bcrypt-nodejs
 * @see https://www.npmjs.com/package/sails-generate-auth
 */
var bcrypt = require('bcrypt-nodejs');

/**
 * 
 */
var setup = function(req, res) {
  res.ok();
};

/**
 * 
 */
var unsubscribe = function (req, res, next) {
  // sails.log.debug("unsubscribe");
  // if(req.session.authenticated) {
  //   sails.sockets.left(req.socket, 'guests');
  // } else {
  //   Content.unsubscribe(req.socket, ['about', 'goals', 'imprint', 'links']);
  // }
}

/**
 * 
 */
var subscribe = function (req, res, next) {

  // sails.log.debug("join");

  if(req.session.authenticated) {
    sails.log.info("authenticated");
    sails.sockets.join(req.socket, 'admins');

    User.find({}).exec(function(err, users) {
      User.subscribe(req.socket, users);
    });

  } else {
    sails.sockets.join(req.socket, 'guests');
  }

  // generell subscribes

  Content.subscribe(req.socket, ['about', 'goals', 'imprint', 'links', 'application']);

  // http://sailsjs.org/#/documentation/reference/websockets/resourceful-pubsub/publishUpdate.html
  Member.find({}).exec(function(err, members) {
    Member.subscribe(req.socket, members);
  });

  Timeline.find({}).exec(function(err, events) {
    Timeline.subscribe(req.socket, events);
  });

  Gallery.find({}).exec(function(err, images) {
    Gallery.subscribe(req.socket, images);
  });

  res.ok();

};

/**
 * try to create an authenticated session
 */
var create = function(req, res, next) {

  SessionService.create(req.session.uri.host, req.param('email'), req.param('password'), req.session, function(err, session) {

    if(!req.wantsJSON) {
      if(err) {
        if(UtilityService.isArray(err) && err[0].message) return res.redirect('signin');
        return res.serverError(err);
      }

      // FIXME
      res.redirect('');
      // if(req.session.lastUrl) {
      //   var url = req.session.lastUrl;
      //   delete req.session.lastUrl;
      //   sails.log.debug("redirect to last url: ",url);
      //   res.redirect(url);
      // } else {
      //   res.redirect('');
      // }
    } else {
      if(err) return res.serverError(err);
      res.json(session);
    }
  });
};

/**
 * 
 */
var authenticated = function(req, res, next) {
  SessionService.authenticated(req.session.uri.host, req.session, function (err, auth) {
    if(err) { return res.serverError(err); }
    return res.json(auth);
  });
};

/**
 * 
 */
var destroy = function(req, res, next) {
  sails.log.info("logout");

  if (typeof(req.params.id) === "undefined")
    var id = req.session.user.id;
  else
    var id = req.params.id;

  User.findOne(id, function foundUser(error, user) {

    // var userId = req.session.user.id;
    if (error) {
      sails.log.error(error);
      return next(error);
    }
    else if (user) {
      // sails.log.debug(user);
      // Wipe out the session (log out)
      //req.session.destroy(); Uncomment to not destroy socket session
      req.session.authenticated = false;
      delete req.session.user;
      return res.json({authenticated:false});
    } else {

      // Wipe out the session (log out)
      //req.session.destroy(); Uncomment to not destroy socket session
      req.session.authenticated = false;
      delete req.session.user;
      return res.json({authenticated:false});
    }
  });
};

/**
 * 
 */
module.exports = {
  setup:setup,
  unsubscribe:unsubscribe,
  subscribe:subscribe,
  create:create,
  authenticated:authenticated,
  destroy:destroy
};

