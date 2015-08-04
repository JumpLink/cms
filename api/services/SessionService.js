/**
 * Server-side logic for managing sessions.
 * @see http://links.sailsjs.org/docs/services
 * @see https://github.com/shaneGirish/bcrypt-nodejs
 * @see https://www.npmjs.com/package/sails-generate-auth
 */
var bcrypt = require('bcrypt-nodejs');

/**
 * try to create an authenticated session
 */
var create = function(host, email, password, session, callback) {

  MultisiteService.getCurrentSiteConfig(host, function (err, config) {

    if(err) return callback(err);

    // Check for email and password in params sent via the form, if none
    // redirect the browser back to the sign-in form.
    if (!email || !password) {
      // return next({error: ["Password doesn't match password confirmation."]});

      var usernamePasswordRequiredError = [{
        name: 'usernamePasswordRequired',
        message: 'You must enter both a username and password.'
      }];

      session.flash = {
        error: usernamePasswordRequiredError
      }

      return callback(usernamePasswordRequiredError);
    }

    // Try to find the user by there email address.
    // findOneByEmail() is a dynamic finder in that it searches the model by a particular attribute.
    // User.findOneByEmail(req.param('email')).done(function(err, user) {
    User.findOne({email: email, site: config.name}, function foundUser(err, user) {
      if (err) {
        return callback(err);
      }
      // sails.log.debug(user);
      // If no user is found...
      if (!user) {
        var noAccountError = [{
          name: 'noAccount',
          message: 'The email address ' + req.param('email') + ' not found.'
        }];

        session.flash = {
          error: noAccountError
        }

        return callback(noAccountError);
      }

      // sails.log.debug(user.password);
      // Compare password from the form params to the encrypted password of the user found.
      bcrypt.compare(password, user.password, function(err, valid) {
        if (err) return callback(err);

        // If the password from the form doesn't match the password from the database...
        if (!valid) {
          var usernamePasswordMismatchError = [{
            name: 'usernamePasswordMismatch',
            message: 'The email or password that you entered is incorrect.'
          }];

          session.flash = {
            error: usernamePasswordMismatchError
          }

          return callback(usernamePasswordMismatchError);
        }

        delete user.password; // TODO do this in model?

        session.user = user;
        session.authenticated = true;
    
        callback(null, session);

      });
    });
  });
};

/**
 * The following functions are public.
 */
module.exports = {
  create:create
};