/**
 * TranslationController
 *
 * @description :: Server-side logic for managing translations
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var fs = require('fs');

module.exports = {
  send: function(req, res, next) {
    var html = '';
    var from = req.param('from');
    var subject = req.param('subject');
    var text = req.param('text');
    if(req.param('html'))
      html = req.param('html');
    if(req.param('htmlPath'))
      html = fs.readFileSync(req.param('htmlPath'));;
    var attachments = req.param('attachments');
    EmailService.send(from, subject, text, html, attachments, function(error, info) {
      res.json({error: error, info:info});
    });

  },
};

