/**
 * HTTP Server Settings
 * (sails.config.http)
 *
 * Configuration for the underlying HTTP server in Sails.
 * Only applies to HTTP requests (not WebSockets)
 *
 * For more information on configuration, check out:
 * http://sailsjs.org/#/documentation/reference/sails.config/sails.config.http.html
 */
var useragent = require('express-useragent');
var MultisiteService = require(__dirname+'/../api/services/MultisiteService.js');
var fs = require('fs-extra');
var tls = require('tls');
var path = require('path');

/**
 * @see http://www.primaryobjects.com/CMS/Article145
 */
function domain(hostName) {
    var domain = hostName;
    
    if (hostName != null) {
        var parts = hostName.split('.').reverse();
        
    if (parts != null && parts.length > 1) {
        domain = parts[1] + '.' + parts[0];
            
        if (hostName.toLowerCase().indexOf('.co.uk') != -1
                && parts.length > 2) {
          domain = parts[2] + '.' + domain;
        }
    }
    }
    
    return domain;
}

/**
 * parseUri 1.2.2
 * (c) Steven Levithan
 * MIT License
 *
 * @see http://stevenlevithan.com
 */
function parseUri (str) {
  var o   = parseUri.options,
    m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
    uri = {},
    i   = 14;

  while (i--) uri[o.key[i]] = m[i] || "";

  uri[o.q.name] = {};
  uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
    if ($1) uri[o.q.name][$1] = $2;
  });

  uri.domain = domain(uri.host);

  return uri;
};

parseUri.options = {
  strictMode: false,
  key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
  q:   {
    name:   "queryKey",
    parser: /(?:^|&)([^&=]*)=?([^&]*)/g
  },
  parser: {
    strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
    loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
  }
};

/**
 * The order in which middleware should be run for HTTP request. (the Sails
 * router is invoked by the "router" middleware below.)
 */
var order = [
  'startRequestTimer',
  'cookieParser',
  'session',
  'uri',
  'useragent',
  'bodyParser',
  'handleBodyParserError',
  'compress',
  'methodOverride',
  'poweredBy',
  '$custom',
  'router',
  'www',
  'favicon',
  '404',
  '500'
];

/**
 * The body parser that will handle incoming multipart HTTP requests.
 * By default as of v0.10, Sails uses [skipper](http://github.com/balderdashy/skipper).
 * @see http://www.senchalabs.org/connect/multipart.html
 */
// var bodyParser = require('skipper');

/**
 * express-useragent is a simple ExpressJS user-agent middleware exposing user-agent details to your application and views.
 * More details on:
 * @see https://github.com/biggora/express-useragent
 */
var useragent = useragent.express();

/**
 * 
 */
var uri = function (req, res, next) {
  // sails.log.debug(req.protocol + '://' + req.get('host') + req.originalUrl);
  // sails.log.info(parseUri(req.protocol + '://' + req.get('host') + req.originalUrl));
  req.session.uri = parseUri(req.protocol + '://' + req.get('host') + req.originalUrl);
  req.session.uri.protocol = req.protocol;
  return next();
};

/**
 * Express middleware to use for every Sails request. To add custom
 * middleware to the mix, add a function to the middleware config object and
 * add its key to the "order" array. The $custom key is reserved for
 * backwards-compatibility with Sails v0.9.x apps that use the
 * `customMiddleware` config option.
 *
 * Example custom middleware; logs each request to the console.
 * ```
 * middleware: {
 *   ...
 *   myRequestLogger: function (req, res, next) {
 *       console.log("Requested :: ", req.method, req.url);
 *       return next();
 *   }
 *   ...
 * }
 * ```
 */
var middleware = {
  order: order,
  // bodyParser: bodyParser,
  useragent: useragent,
  uri: uri
};

/**
 * The number of seconds to cache flat files on disk being served by
 * Express static middleware (by default, these files are in `.tmp/public`)
 *
 * The HTTP static cache is only active in a 'production' environment,
 * since that's the only time Express will cache flat-files.
 */
var cache = 31557600000;

/**
 * Dynamically Return an SSL Certificate using SNI.
 * @see https://en.wikipedia.org/wiki/Server_Name_Indication
 * @see https://stackoverflow.com/questions/12219639/is-it-possible-to-dynamically-return-an-ssl-certificate-in-nodejs
 * @see https://nodejs.org/api/tls.html#tls_tls_createserver_options_secureconnectionlistener
 */
var serverOptions = {
  SNICallback: function (domain, cb) {
    console.log("SNICallback from domain:", domain);
    MultisiteService.getCurrentSiteConfig(domain, function (err, siteConf) {
      if(err) return cb(err);
      var dirname = MultisiteService.getSitePathFromSiteConf(siteConf);
      var ca_path = path.join(dirname, siteConf.ssl.ca);
      var key_path = path.join(dirname, siteConf.ssl.key);
      var cert_path = path.join(dirname, siteConf.ssl.cert);

      sails.log.debug(dirname, ca_path ,key_path, cert_path);

      var ctx = tls.createSecureContext({
        ca: fs.readFileSync(ca_path),
        key: fs.readFileSync(key_path),
        cert: fs.readFileSync(cert_path),
        passphrase: siteConf.ssl.passphrase
      });

      cb(null, ctx);

    });
  }
};

/**
 * Apply the following functions to hhtp config.
 * To deactivate own ssl stuff, command out `serverOptions`
 */
module.exports.http = {
  middleware: middleware,
  cache: cache,
  // serverOptions: serverOptions
};
