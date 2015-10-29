/**
 * The UseragentService makes use of and provides additional functions for [express-useragent](https://github.com/biggora/express-useragent) that was processed on server. 
 */
var useragent = require('express-useragent');

/**
 * 
 */
var getPrimaryVersion = function (req) {

  if(typeof(req.useragent) === 'undefined') {
    sails.log.warn('[UseragentService.getPrimaryVersion] Useragent not set, try to set it', req.headers);
    req.useragent = useragent.parse(req.headers['user-agent']);
    sails.log.warn('[UseragentService.getPrimaryVersion] req.useragent:', req.useragent);
  }

  var primaryVersion = 0;
  var firstDotIndex = -1;
  // primaryVersion = Number(req.useragent.version);
  if(typeof(req.useragent.version) !== 'undefined') {
    firstDotIndex = req.useragent.version.indexOf('.');
    if(firstDotIndex < 0)
      primaryVersion = req.useragent.version;
    else
      primaryVersion = req.useragent.version.substr(0, firstDotIndex);
  }
  return primaryVersion;
}

/**
 * 
 */
var supported = function (req) {

  req.useragent.PrimaryVersion = getPrimaryVersion(req);

  // sails.log.debug(req.useragent);

  if(req.useragent.isChrome && req.useragent.PrimaryVersion >= 33) {
     // sails.log.debug("Allowed Version of Chrome");
     return true;
  }
  // WORKAROUND until merge https://github.com/biggora/express-useragent/pull/30
  if(req.useragent.isChrome && (req.useragent.PrimaryVersion >= 33 || typeof (req.useragent.PrimaryVersion) === 'undefined')) {
    // sails.log.debug("Allowed Version of Chromium");
    return true;
  }
  if(req.useragent.isDesktop && req.useragent.isFirefox && req.useragent.PrimaryVersion >= 32)
    return true;
  if(req.useragent.isOpera && req.useragent.PrimaryVersion >= 12)
    return true;
  // To slow?
  if(req.useragent.isEpiphany)
    return false;
  // TESTME
  if(req.useragent.isSafari && req.useragent.PrimaryVersion >= 7)
    return true;
  // TESTME
  if(req.useragent.isIE)
    return false;

  return false;
}

/**
 * 
 */
module.exports = {
  supported: supported
}
