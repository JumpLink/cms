/**
 * EmailController to send emails
 */

var fs = require('fs');

/**
 * 
 */
var setup = function(req, res) {
  res.ok();
};

/**
 * Send a mail using an existing service like gmail
 *
 * @see https://github.com/andris9/Nodemailer
 */
var send = function(req, res, next) {
  var host = req.session.uri.host;
  var from = req.param('from');
  var to = req.param('to');
  var subject = req.param('subject');
  var text = req.param('text');
  var html = '';
  if(req.param('html'))
    html = req.param('html');
  if(req.param('htmlPath'))
    html = fs.readFileSync(req.param('htmlPath'));;
  var attachments = req.param('attachments');
  EmailService.send(host, from, to, subject, text, html, attachments, function(error, info) {
    if(error) return res.serverError(error);
    var result = {host:host, from:from, to:to, subject:subject, text:text, html:html, attachments:attachments, error:error, info:info};
    // http://sailsjs.org/#/documentation/reference/websockets/sails.sockets/sails.sockets.broadcast.html
    sails.sockets.broadcast('admins', 'email', result);
    res.json(result);
  });
};

var receive = function (req, res, next) {

};

/**
 * 
 */
module.exports = {
  setup:setup,
  send:send,
  receive:receive
};

