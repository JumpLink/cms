/*jslint node: true */
'use strict';

module.exports = function(grunt) {
  
  // Client-side javascript files to inject in order
  // (uses Grunt-style wildcard/glob/splat expressions)
  var jsFiles = [
  
    // Dependencies like sails.io.js, jQuery, or Angular
    // are brought in here
  
    //- es5-shim: ECMAScript 5 compatibility shims for legacy JavaScript engines: https://github.com/es-shims/es5-shim
    'assets/third-party/es5-shim/es5-shim.js',
    'assets/third-party/es5-shim/es5-sham.js',
  
    //- masonry and imagesloaded
    'assets/third-party/jquery/dist/jquery.js',
    'assets/third-party/jquery-bridget/jquery.bridget.js',
    // 'assets/third-party/get-style-property/get-style-property.js',
    // 'assets/third-party/get-size/get-size.js',
    'assets/third-party/eventEmitter/EventEmitter.js',
    'assets/third-party/eventie/eventie.js',
    // 'assets/third-party/doc-ready/doc-ready.js',
    // 'assets/third-party/matches-selector/matches-selector.js',
    // 'assets/third-party/outlayer/item.js',
    // 'assets/third-party/outlayer/outlayer.js',
    // 'assets/third-party/masonry/masonry.js',
    'assets/third-party/imagesloaded/imagesloaded.js',
  
    //- angular
    'assets/third-party/angular/angular.js',
    'assets/third-party/angular-i18n/angular-locale_de.js',
    'assets/third-party/moment/moment.js',
    'assets/third-party/angular-moment/angular-moment.js',
    'assets/third-party/moment/locale/de.js',
    'assets/third-party/angular-fullscreen/src/angular-fullscreen.js',
    'assets/third-party/webodf/webodf-debug.js',
    'assets/third-party/angular-animate/angular-animate.js',
    'assets/third-party/angular-ui-router/release/angular-ui-router.js',
    'assets/third-party/angular-sanitize/angular-sanitize.js',
    'assets/third-party/angular-touch/angular-touch.js',
    'assets/third-party/angular-strap/dist/angular-strap.js',
    'assets/third-party/angular-carousel/dist/angular-carousel.js',
    'assets/third-party/angular-fullscreen/src/angular-fullscreen.js',
  
    //- textAngular
    //- 'assets/third-party/textAngular/dist/textAngular.min.js',
  
    //- angular-medium-editor
    'assets/third-party/medium-editor/dist/js/medium-editor.js',
    'assets/third-party/angular-medium-editor/dist/angular-medium-editor.js',
  
    //- angular-ui-ace
    'assets/third-party/ace-builds/src-noconflict/ace.js',
    'assets/third-party/ace-builds/src-noconflict/mode-html.js',
    'assets/third-party/angular-ui-ace/ui-ace.js',
  
    //- angular-masonry
    // 'assets/third-party/angular-masonry/angular-masonry.js',
  
    //- html, css, javascript beautifier
    'assets/third-party/js-beautify/js/lib/beautify.js',
    'assets/third-party/js-beautify/js/lib/beautify-css.js',
    'assets/third-party/js-beautify/js/lib/beautify-html.js',
  
    //- angular-leaflet-directive: https://github.com/tombatossals/angular-leaflet-directive
    'assets/third-party/leaflet/dist/leaflet-src.js',
    'assets/third-party/Leaflet.label/dist/leaflet.label-src.js',
    'assets/third-party/angular-leaflet-directive/dist/angular-leaflet-directive.js',
  
    //- AngularJS-Toaster: https://github.com/jirikavi/AngularJS-Toaster: https://github.com/jirikavi/AngularJS-Toaster
    'assets/third-party/AngularJS-Toaster/toaster.js',
  
    //- async: https://github.com/caolan/async
    'assets/third-party/async/lib/async.js',
  
    //- generic angular filters: https://github.com/niemyjski/angular-filters
    'assets/third-party/ng-filters/dist/angular-filters.js',
  
    //- angular-file-upload: https://github.com/nervgh/angular-file-upload
    'assets/third-party/angular-file-upload/angular-file-upload.js',
  
    //- Bring in the socket.io client
    'assets/third-party/socket.io-client/socket.io.js',
    'assets/third-party/sails.io.js/sails.io.js',
    'assets/third-party/angularSails/dist/ngsails.io.js',
  
    'assets/js/app.js',
    'assets/js/bootstrap.js',
    'assets/js/translations.js',
    'assets/js/services.js',
    'assets/js/controllers.js',
    'assets/js/bootstrap/controllers.js',
    'assets/js/bootstrap/directives.js',
    'assets/js/directives/*'
  ];

  
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: jsFiles,
        dest: 'assets/js/app.concat.js'
      }
    },
    
    less: {
      dist: {
        options: {
          cleancss: true,
          compress: true
        },
        files: [
          {
            expand: true,
            cwd: 'assets/styles/',
            src: ['app.less'],
            dest: 'assets/styles/',
            ext: '.css'
          }
        ]
      }
    }
    
  });
  
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-less');

  grunt.registerTask('dev', [ 'concat:dist', 'less:dist' ]);
  grunt.registerTask('prod', [ 'concat:dist', 'less:dist' ]);
};