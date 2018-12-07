module.exports = function(grunt) {
  grunt.initConfig({
    browserify: {
      dist: {
        options: {
          transform: ['envify', 'babelify']
        },
        src: ['src/startup.js'],
        dest: 'dist/livereload.js'
      },

      test: {
        src: ['test/html/browserified/main.js'],
        dest: 'test/html/browserified/bundle.js'
      }
    },

    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/*.js']
      }
    }
  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.registerTask('build', ['browserify:dist']);
  grunt.registerTask('test', ['mochaTest']);
  grunt.registerTask('default', ['build', 'test']);
};
