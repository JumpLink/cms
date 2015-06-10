var nodemailer = require('nodemailer');

var send = function (host, from, to, subject, text, html, attachments, callback) {

  MultisiteService.getCurrentSiteConfig(host, function (err, config) {
    if(err) { sails.log.error(err); return callback(err); }
    // console.log(sails.config.email);
    // create reusable transporter object using SMTP transport
    var transporter = nodemailer.createTransport({
      service: 'Gmail'
      , auth: config.email
    });

    // NB! No need to recreate the transporter object. You can use
    // the same transporter object for all e-mails

    // setup e-mail data with unicode symbols
    var mailOptions = {
      from: from          //'Fred Foo ✔ <foo@blurdybloop.com>',     // sender address
      , to: to            //'pascal@jumplink.eu'                    // list of receivers
      , subject: Subject  //'Aufnahmeantrag',                       // Subject line
      , text: text        // 'Hello world',                         // plaintext body
      , html: html        //'<b>Hello world</b>'                    // html body
      , attachments: attachments
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
      if(error){
        sails.log.error(error);
      }else{
        sails.log.debug('Message sent: ' + info.response);
      }
      callback(error, info);
    });
  });
}

module.exports = {
  send:send
}