var easyimg = require('easyimage');
var path = require('path');
var fs = require('fs-extra');
var argv = require('minimist')(process.argv.slice(2));
console.log(argv);

// http://stackoverflow.com/questions/646628/how-to-check-if-a-string-startswith-another-string
var stringStartsWith = function (string, prefix) {
  return string.slice(0, prefix.length) == prefix;
};

// http://stackoverflow.com/questions/4250364/how-to-trim-a-file-extension-from-a-string-in-javascript
var removeExtension = function(string) {
  return string.replace(/\.[^/.]+$/, "");
}

var rescope = function (imageItem) {
  easyimg.rescrop({
     src:imageItem.path,
     dst:imageItem.rescrop,
     width:960,
     cropwidth:960,
     cropheight:720,
     x:0,
     y:0,
    }).then(
    function(image) {
      console.log('Resized and cropped: ' + image.width + ' x ' + image.height);
      easyimg.convert({
        src:imageItem.rescrop,
        dst:imageItem.rescrop_png,
      }).then(
        function (file) {
          file.should.be.a('object');
          file.should.have.property('type');
          file.type.should.be.equal('png');
          file.name.should.be.equal('convert.png');
        },
        function (err) {
          console.dir(err);
        }
      );
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
      item.rescrop = argv.dir+'/'+'rescrop_'+item.basename;
      item.rescrop_png = removeExtension(item.rescrop)+'.png';
      items.push(item);
    }
    
  })
  .on('end', function () {
    console.dir(items); // => [ ... array of files]
    for (var i = 0; i < items.length; i++) {
      rescope(items[i]);
    }
  });

