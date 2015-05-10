module.exports = function (grunt) {
	grunt.registerTask('build', [
		'hub:clean',
		'hub:build'
	]);
};
