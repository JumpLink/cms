/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#/documentation/reference/sails.config/sails.config.bootstrap.html
 */
module.exports.bootstrap = function(cb) {
  sails.log.debug("[bootstrap]", cb);
  var fs = require('fs');
  var _ = require('underscore');
  var async = require('async');
  var jade = require('jade');
  sails.pm2 = require('pm2');
  GLOBAL.UlilityService = require('../api/services/UtilityService.js');
  GLOBAL.EmailService = require('../api/services/EmailService.js');
  GLOBAL.MultisiteService = require('../api/services/MultisiteService.js');
  GLOBAL.ThemeService = require('../api/services/ThemeService.js');

  var sendStartMail = function (attachments, cb) {
    sails.log.debug("[bootstrap.sendStartMail]");
    ThemeService.getAdminConfigAndTheme(function(err, config, theme) {
      if(UlilityService.isDefined(err) && err !== null) {
        return cb(err);
      }
      sails.log.debug("[bootstrap.sendStartMail] config", config);
      sails.log.debug("[bootstrap.sendStartMail] theme", theme);
      ThemeService.getFileByThemeDirname(theme.dirname, 'views/email/restart.jade', {}, function(err, fullpath) {
        if(UlilityService.isDefined(err) && err !== null) {
          return cb(err);
        }

       var locals = {
          title: "JumpLink CMS started",
          message: "JumpLink CMS was (re)started, if that was unintentionally please check log files",
          link: "http://docs.jumplink.eu/",
          linktext: "JumpLink CMS Documentation",
        };

        var html = jade.renderFile(fullpath, locals);

        EmailService.sendWithoutHost(config.email.service, config.email.auth, config.email.address, config.email.receiver, locals.title, null, html, attachments, cb);
      });
    });
  };

  var sendLogs = function () {
    sails.pm2.describe('cms', function (err, desc) {
      if(UlilityService.isDefined(err) && err !== null) {
        sails.log.error(err);
        return cb(err);
      }
      var loggile = desc[0].pm2_env.pm_out_log_path;
      var errlogfile = desc[0].pm2_env.pm_err_log_path;
      var attachments = [
        { 
          path: loggile
        },
        { 
          path: errlogfile
        },
      ];

      sendStartMail(attachments, function (err, info) {
        if(UlilityService.isDefined(err) && err !== null) {
          sails.log.error("[bootstrap] sendStartMail error", new Error(err));
        } else {
          sails.log.debug("[bootstrap] sendStartMail info", info);
        }
      });
    });
  };

  if(sails.config.emailReception) {
    EmailService.start();
  }
  
  sails.pm2.connect(function() {
    if(sails.config.sendMailOnStart) {
      sendLogs();
    }
    /**
     * It's very important to trigger this callback method when you are finished with the bootstrap!
     * Otherwise your server will never lift, since it's waiting on the bootstrap)
     */
    cb(); // do not wait for send mail
  });


};
