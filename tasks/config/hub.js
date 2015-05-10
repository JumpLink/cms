/**
 * Run predefined tasks whenever watched file patterns are added, changed or deleted.
 *
 * ---------------------------------------------------------------
 *
 * Watch for changes on
 * - files in the `assets` folder
 * - the `tasks/pipeline.js` file
 * and re-run the appropriate tasks.
 *
 * For usage docs see:
 * 		https://github.com/gruntjs/grunt-contrib-watch
 *
 */

module.exports = function(grunt) {

  grunt.config.set('hub', {
    'watch-dev': {
      src: ['./public/themes/*/Gruntfile.js'],
      tasks: ['watch-dev']
    },
    'watch-prod': {
      src: ['./public/themes/*/Gruntfile.js'],
      tasks: ['watch-prod']
    },
    'build-dev': {
      src: ['./public/themes/*/Gruntfile.js'],
      tasks: ['build-dev']
    },
    'build-prod': {
      src: ['./public/themes/*/Gruntfile.js'],
      tasks: ['build-prod']
    },
    'clean': {
      src: ['./public/themes/*/Gruntfile.js'],
      tasks: ['clean']
    }
  });

  grunt.loadNpmTasks('grunt-hub');
};
