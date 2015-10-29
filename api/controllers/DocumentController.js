/**
 * DocumentController to get the docs as json
 */
var exec = require('child_process').exec;
var path = require('path');
var fs = require('fs');
var UPLOADFOLDER =  __dirname+'/../../.tmp/uploads';

/**
 * 
 */
var setup = function(req, res) {
  res.ok();
};

/**
 * 
 */
var upload = function (req, res) {
  req.file("documents").upload(function (err, files) {
    if (err) {
      sails.log.error(err);
      return res.serverError(err);
    }

    for (var i = 0; i < files.length; i++) {
      files[i].uploadedAs = path.basename(files[i].fd);
    };

    // EmailService.send(from, subject, text, html);

    return res.json({
      message: files.length + ' file(s) uploaded successfully!',
      files: files
    });
  });
};

/**
 * TODO use DocumentService.convert
 */
var convert = function (req, res) {
  var stdout = '';
  var stderr = '';
  sails.log.info('convert');
  if(!req.param('filename')) res.badRequest('filename is required');
  var source = req.param('filename');
  var inputDir = UPLOADFOLDER +'/'+source;
  var outputFileExtension = req.param('extension') ? req.param('extension') : 'pdf'; // example 'pdf';
  var outputFilterName = req.param('filter') ? ':'+req.param('filter') : '';  //(optinal) example ':'+'MS Excel 95';
  var outputDir = UPLOADFOLDER;
  if(req.param('dir')) {
    outputDir += '/'+req.param('dir');
  }
  outputDir = path.normalize(outputDir);
  inputDir = path.normalize(inputDir);
  var target = outputDir+"/"+path.basename(source, '.odt')+"."+outputFileExtension;
  var command = 'soffice --headless --invisible --convert-to '+outputFileExtension+outputFilterName+' --outdir '+'"'+outputDir+'" "'+inputDir+'"';
  sails.log.info(command);
  var child = exec(command, function (code, stdout, stderr) {
    if(code) {
      sails.log.error(code);
    }
    if(stderr) {
      sails.log.error(stderr);
    }
    if(stdout) {
      sails.log.info(stdout);
    }
    res.json({target:target, code: code, stdout: stdout, stderr: stderr});
    // res.download(target); // not working over socket.io
  });
};

/**
 * 
 */
module.exports = {
  setup:setup,
  upload:upload,
  convert:convert
};
