module.exports = function (grunt) {
	grunt.registerTask('default', ['hub:clean', 'hub:build-dev',  'hub:watch-dev']);
};
