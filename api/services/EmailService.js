/**
 * 
 * @see https://github.com/Flolagale/mailin
 */

var nodemailer = require('nodemailer'); // for send mails
var mailin = null;

/**
 * nodemailer send
 */
var send = function (host, from, to, subject, text, html, attachments, callback) {

  MultisiteService.getCurrentSiteConfig(host, function (err, config) {
    if(err) { sails.log.error(err); return callback(err); }
    // console.log(sails.config.email);
    // create reusable transporter object using SMTP transport
    var transporter = nodemailer.createTransport({
      service: config.email.service,
      auth: config.email.auth
    });

    sails.log.debug("[EmailService.send] transporter", transporter, "config.email.service", config.email.service, "config.email.auth", config.email.auth);

    // NB! No need to recreate the transporter object. You can use
    // the same transporter object for all e-mails

    // setup e-mail data with unicode symbols
    var mailOptions = {
      from: from          //'Fred Foo ✔ <foo@blurdybloop.com>',     // sender address
      , to: to            //'pascal@jumplink.eu'                    // list of receivers
      , subject: subject  //'Aufnahmeantrag',                       // Subject line
      , text: text        // 'Hello world',                         // plaintext body
      , html: html        //'<b>Hello world</b>'                    // html body
      , attachments: attachments
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
      if(error){
        sails.log.error(error);
        return callback(error);
      }

      sails.log.debug('Message sent: ' + info.response);
      callback(null, info);
    });
  });
}

/**
 * Start the Mailin server. The available options are:
 *
 *     options = {
 *        port: 25,
 *        webhook: 'http://mydomain.com/mailin/incoming,
 *        disableWebhook: false,
 *        logFile: '/some/local/path',
 *        logLevel: 'warn', // One of silly, info, debug, warn, error
 *        smtpOptions: { // Set of options directly passed to simplesmtp.createServer(smtpOptions)
 *           SMTPBanner: 'Hi from a custom Mailin instance',
 *           // By default, the DNS validation of the sender and recipient domains is disabled so.
 *           // You can enable it as follows:
 *           disableDNSValidation: false
 *        }
 *     };
 *
 * Here disable the webhook posting so that you can do what you want with the
 * parsed message.
 */
var start = function () {
  sails.log.debug("startResiveServer");
  mailin = require('mailin');         // for receive mails
  mailin.start({
    port: 25,
    disableWebhook: true // Disable the webhook posting.
  });

  /* Access simplesmtp server instance. */
  mailin.on('authorizeUser', function(connection, username, password, done) {
    if (username == "johnsmith" && password == "mysecret") {
      done(null, true);
    } else {
      done(new Error("Unauthorized!"), false);
    }
  });

  /* Event emitted when a connection with the Mailin smtp server is initiated. */
  mailin.on('startMessage', function (connection) {
    /* connection = {
        from: 'sender@somedomain.com',
        to: 'someaddress@yourdomain.com',
        id: 't84h5ugf',
        authentication: { username: null, authenticated: false, status: 'NORMAL' }
      }
    }; */
    sails.log.info(connection);
  });

  
  mailin.on('message', receive);
};

/**
 * Event emitted after a message was received and parsed.
 */
var receive = function (connection, data, content) {
  sails.log.info("[EmailService.receive]", connection, data, content);

  /*
   * Do something useful with the parsed message here.
   * Use parsed message `data` directly or use raw message `content`.
   */
}



/**
 * 
 */
module.exports = {
  send: send,
  start: start
}