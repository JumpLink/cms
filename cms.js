/**
 * app.js
 *
 * Use `app.js` to run your app without `sails lift`.
 * To start the server, run: `node app.js`.
 *
 * This is handy in situations where the sails CLI is not relevant or useful.
 *
 * For example:
 *   => `node app.js`
 *   => `forever start app.js`
 *   => `node debug app.js`
 *   => `modulus deploy`
 *   => `heroku scale`
 *
 *
 * The same command-line arguments are supported, e.g.:
 * `node app.js --silent --port=80 --prod`
 */

// Ensure we're in the project directory, so relative paths work as expected
// no matter where we actually lift from.
process.chdir(__dirname);


var fs = require('fs');
// var spawn = require('child_process').spawn;
var path = require('path');
var log = require('captains-log')();
var platform = path.basename(process.argv[0]); // iojs, node, nodejs, etc

// TODO move this to bootstrap
fs.exists('config/local.json', function(exists) { 
  if (!exists) {
    log.warn("Your config/local.json is missing, start configuration webapp..");
    startConfig();
  } else {
    lift();
  }
});

/**
 * 
 */
var lift = function () {
  // Ensure a "local.json" can be loaded:
  try {
    var local = require('./config/local.json');
  } catch (e) {
    log.error('Your config/local.json ist corrupt or missing!');
    return;
  }
  // Ensure a "sails" can be located:
  var sails;
  try {
    sails = require('sails');
  } catch (e) {
    log.error('To run an app using `node app.js`, you usually need to have a version of `sails` installed in the same directory as your app.');
    log.error('To do that, run `npm install sails`');
    log.error('');
    log.error('Alternatively, if you have sails installed globally (i.e. you did `npm install -g sails`), you can use `sails lift`.');
    log.error('When you run `sails lift`, your app will still use a local `./node_modules/sails` dependency if it exists,');
    log.error('but if it doesn\'t, the app will run with the global sails instead!');
    return;
  }

  // Try to get `rc` dependency
  var rc;
  try {
    rc = require('rc');
  } catch (e0) {
    try {
      rc = require('sails/node_modules/rc');
    } catch (e1) {
      log.error('Could not find dependency: `rc`.');
      log.error('Your `.sailsrc` file(s) will be ignored.');
      log.error('To resolve this, run:');
      log.error('npm install rc --save');
      rc = function () { return {}; };
    }
  }


  // Start server
  sails.lift(rc('sails'));
}

/**
 * 
 */
var startConfig = function () {
  log.error("TODO");
}