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
    // User.findOneByEmail(email).done(function(err, user) {
    User.findOne({email: email, site: config.name}, function foundUser(err, user) {
      if (err) {
        return callback(err);
      }
      // sails.log.debug(user);
      // If no user is found...
      if (!user) {
        var noAccountError = [{
          name: 'noAccount',
          message: 'The email address ' + email + ' not found.'
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
        session.site = config.name;
    
        callback(null, session);

      });
    });
  });
};

/**
 * 
 */
var isAuthenticated = function(conf, session, callback) {
  var isAuthenticated = session.authenticated === true && session.site === conf.name;
  if(UtilityService.isFunction(callback)) {
    return callback(null, isAuthenticated);
  }
  return isAuthenticated;
};

/**
 * 
 */
var authenticated = function(host, session, callback) {
  MultisiteService.getCurrentSiteConfig(host, function (err, conf) {
    if(err) {
      return callback(err);
    }
    sails.log.debug("[SessionService.authenticated]", "session", session);
    return callback(null, isAuthenticated(conf, session));
  });
};

/**
 * 
 */
var isBloggerOrBetter = function (conf, session, callback) {
  var isBloggerOrBetter = isAuthenticated(conf, session) && (session.user.role === 'blogger' || session.user.role === 'siteadmin' || session.user.role === 'superadmin');
  if(UtilityService.isFunction(callback)) {
    return callback(null, isBloggerOrBetter);
  }
  return isBloggerOrBetter;
}

/**
 * 
 */
var bloggerOrBetter = function (host, session, callback) {
  MultisiteService.getCurrentSiteConfig(host, function (err, conf) {
    if(err) {
      return callback(err);
    }
    return callback(null, isBloggerOrBetter(conf, session));
  });
}

/**
 * 
 */
var isDeveloperOrBetter = function (conf, session, callback) {
  var isDeveloperOrBetter = sails.config.environment === 'development' || (isAuthenticated(conf, session) && session.user.role === 'superadmin');
  if(UtilityService.isFunction(callback)) {
    return callback(null, isDeveloperOrBetter);
  }
  return isDeveloperOrBetter;
}

/**
 * 
 */
var developerOrBetter = function (host, session, callback) {
  MultisiteService.getCurrentSiteConfig(host, function (err, conf) {
    if(err) {
      return callback(err);
    }
    return callback(null, isDeveloperOrBetter(conf, session));
  });
}

/**
 * 
 */
var isSiteadminOrBetter = function (conf, session, callback) {
  var isSiteadminOrBetter = isAuthenticated(conf, session) && (session.user.role === 'siteadmin' || session.user.role === 'superadmin');
  if(UtilityService.isFunction(callback)) {
    return callback(null, isSiteadminOrBetter);
  }
  return isSiteadminOrBetter;
}

/**
 * 
 */
var siteadminOrBetter = function (host, session, callback) {
  MultisiteService.getCurrentSiteConfig(host, function (err, conf) {
    if(err) {
      return callback(err);
    }
    return callback(null, isSiteadminOrBetter(conf, session));
  });
}

/**
 * 
 */
var isSuperadmin = function (conf, session, callback) {
  var isSuperadmin = isAuthenticated(conf, session) && session.user.role === 'superadmin';
  if(UtilityService.isFunction(callback)) {
    return callback(null, isSuperadmin);
  }
  return isSuperadmin;
}

/**
 * 
 */
var superadmin = function (host, session, callback) {
  MultisiteService.getCurrentSiteConfig(host, function (err, conf) {
    if(err) {
      return callback(err);
    }
    return callback(null, isSuperadmin(conf, session));
  });
}

/**
 * 
 */
var isEmployee = function (conf, session, callback) {
  var isEmployee = isAuthenticated(conf, session) && session.user.role === 'employee';
  if(UtilityService.isFunction(callback)) {
    return callback(null, isEmployee);
  }
  return isEmployee;
}

/**
 * 
 */
var employee = function (host, session, callback) {
  MultisiteService.getCurrentSiteConfig(host, function (err, conf) {
    if(err) {
      return callback(err);
    }
    return callback(null, isEmployee(conf, session));
  });
}

/**
 * 
 */
var isEmployeeOrBetter = function (conf, session, callback) {
  var isEmployeeOrBetter = isAuthenticated(conf, session) && (session.user.role === 'employee' || session.user.role === 'blogger' || session.user.role === 'siteadmin' || session.user.role === 'superadmin');
  if(UtilityService.isFunction(callback)) {
    return callback(null, isEmployeeOrBetter);
  }
  return isEmployeeOrBetter;
}

/**
 * 
 */
var employeeOrBetter = function (host, session, callback) {
  MultisiteService.getCurrentSiteConfig(host, function (err, conf) {
    if(err) {
      return callback(err);
    }
    return callback(null, isEmployeeOrBetter(conf, session));
  });
}

var getAllPolicies = function (host, session, callback) {
  var results = {};
  MultisiteService.getCurrentSiteConfig(host, function (err, conf) {
    if(err) {
      return callback(err);
    }
    results.authenticated = isAuthenticated(conf, session);
    results.bloggerOrBetter = isBloggerOrBetter(conf, session);
    results.developerOrBetter = isDeveloperOrBetter(conf, session);
    results.siteadminOrBetter = isSiteadminOrBetter(conf, session);
    results.superadmin = isSuperadmin(conf, session);
    results.employee = isEmployee(conf, session);
    results.employeeOrBetter = isEmployeeOrBetter(conf, session);
    return callback(null, results);
  });
};

var getUser = function (host, session, callback) {
  var results = {};
  MultisiteService.getCurrentSiteConfig(host, function (err, conf) {
    if(err) {
      return callback(err);
    }
    if(session.site !== conf.name) {
      return callback("session is not the session for the current site.");
    }
    return callback(null, session.user);
  });
};


/**
 * The following functions are public.
 */
module.exports = {
  create:create,
  authenticated: authenticated,
  bloggerOrBetter: bloggerOrBetter,
  developerOrBetter: developerOrBetter,
  siteadminOrBetter: siteadminOrBetter,
  superadmin: superadmin,
  employee: employee,
  employeeOrBetter: employeeOrBetter,
  getAllPolicies: getAllPolicies,
  getUser: getUser
};