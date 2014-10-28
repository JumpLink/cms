var getPrimaryVersion = function (req) {
  var primaryVersion = 0;
  var firstDotIndex = -1;
  if(typeof req.useragent.Version != 'undefined')
    firstDotIndex = req.useragent.Version.indexOf('.');
  if(firstDotIndex < 0)
    primaryVersion = req.useragent.Version;
  else
    primaryVersion = req.useragent.Version.substr(0, firstDotIndex);
  return primaryVersion;
}

var supported = function (req) {

  req.useragent.PrimaryVersion = getPrimaryVersion(req);

  // sails.log.debug(req.useragent);

  if(req.useragent.isChrome && req.useragent.PrimaryVersion >= 33)
    return true;
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

module.exports = {
  supported:supported
}
