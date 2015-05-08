// https://github.com/shama/grunt-hub
module.exports = function(grunt) {

  grunt.config.set('hub', {
    dev: {
      files: [
        {
          src: ['./themes/*/Gruntfile.js'],
          tasks: ['dev']
        }
      ]
    },
    prod: {
      files: [
        {
          src: ['./themes/*/Gruntfile.js'],
          tasks: ['prod']
        }
      ]
    }
  });

  grunt.loadNpmTasks('grunt-hub');
};
