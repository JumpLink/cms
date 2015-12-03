var easyimg = require('easyimage');
var path = require('path');
var fs = require('fs-extra');
var argv = require('minimist')(process.argv.slice(2));
console.log(argv);

// http://stackoverflow.com/questions/646628/how-to-check-if-a-string-startswith-another-string
var stringStartsWith = function (string, prefix) {
  return string.slice(0, prefix.length) == prefix;
};

var rescope = function (imagePath) {
  easyimg.rescrop({
     src:imagePath, dst:argv.dir+'/'+'rescrop_'+path.basename(imagePath),
     width:960,
     cropwidth:960,
     cropheight:720,
     x:0,
     y:0,
    }).then(
    function(image) {
      console.log('Resized and cropped: ' + image.width + ' x ' + image.height);
    },
    function (err) {
      console.dir(err);
    }
  );
};

var items = []; // files, directories, symlinks, etc
fs.walk(argv.dir)
  .on('data', function (item) {
    item.basename = path.basename(item.path);
    // console.log(item.basename);
    if(!stringStartsWith(item.basename, 'rescrop_') && !stringStartsWith(item.basename, 'thumb_') && !stringStartsWith(item.basename, 'gallery')) {
      items.push(item.path);
    }
    
  })
  .on('end', function () {
    console.dir(items); // => [ ... array of files]
    for (var i = 0; i < items.length; i++) {
      rescope(items[i]);
    }
  });

