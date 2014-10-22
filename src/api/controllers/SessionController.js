/**
 * SessionController
 *
 * @description :: Server-side logic for managing sessions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var bcrypt = require('bcrypt');

module.exports = {

  // unsubscribe: function (req, res, next) {
  //   sails.log.debug("unsubscribe");
  //   if(req.session.authenticated) {
  //     sails.sockets.left(req.socket, 'guests');
  //   } else {
  //     Content.unsubscribe(req.socket, ['about', 'goals', 'imprint', 'links']);
  //   }
  // }

  subscribe: function (req, res, next) {

    sails.log.debug("join");

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

  }

  // try to create an authenticated session
  , create: function(req, res, next) {

    // Check for email and password in params sent via the form, if none
    // redirect the browser back to the sign-in form.
    if (!req.param('email') || !req.param('password')) {
      // return next({error: ["Password doesn't match password confirmation."]});

      var usernamePasswordRequiredError = [{
        name: 'usernamePasswordRequired',
        message: 'You must enter both a username and password.'
      }]

      // Remember that err is the object being passed down (a.k.a. flash.err), whose value is another object with
      // the key of usernamePasswordRequiredError
      req.session.flash = {
        error: usernamePasswordRequiredError
      }

      return res.redirect('signin');
    }

    // Try to find the user by there email address.
    // findOneByEmail() is a dynamic finder in that it searches the model by a particular attribute.
    // User.findOneByEmail(req.param('email')).done(function(err, user) {
    User.findOneByEmail(req.param('email'), function foundUser(err, user) {
      if (err) {
        return res.badRequest(err);
      }
      console.log(user);
      // If no user is found...
      if (!user) {
        var noAccountError = [{
          name: 'noAccount',
          message: 'The email address ' + req.param('email') + ' not found.'
        }]

        req.session.flash = {
          error: noAccountError
        }

        return res.redirect('signin');
      }

      console.log(user.password);
      // Compare password from the form params to the encrypted password of the user found.
      bcrypt.compare(req.param('password'), user.password, function(err, valid) {
        if (err) return next(err);

        // If the password from the form doesn't match the password from the database...
        if (!valid) {
          var usernamePasswordMismatchError = [{
            name: 'usernamePasswordMismatch',
            message: 'The email or password that you entered is incorrect.'
          }]

          req.session.flash = {
            error: usernamePasswordMismatchError
          }

          return res.redirect('signin');
        }

        // Log user in
        req.session.authenticated = true;
        req.session.User = user;

        delete user.password; // TODO do this in model?
        //return res.json({authenticated:true,user:user});

        if(req.session.lastUrl) {
          var url = req.session.lastUrl;
          delete req.session.lastUrl;
          return res.redirect(url);
        }

        return res.redirect('singedin');

      });
    });
  },

  destroy: function(req, res, next) {
    sails.log.debug("logout");

    if (typeof(req.params.id) === "undefined")
      var id = req.session.User.id;
    else
      var id = req.params.id;

    User.findOne(id, function foundUser(error, user) {

      // var userId = req.session.User.id;
      if (error) {
        sails.log.error(error);
        return next(error);
      }
      else if (user) {
        sails.log.debug(user);
        // Wipe out the session (log out)
        //req.session.destroy(); Uncomment to not destroy socket session
        req.session.authenticated = false;
        delete req.session.User;
        return res.json({authenticated:false});
      } else {

        // Wipe out the session (log out)
        //req.session.destroy(); Uncomment to not destroy socket session
        req.session.authenticated = false;
        delete req.session.User;
        return res.json({authenticated:false});
      }
    });
  },
};

