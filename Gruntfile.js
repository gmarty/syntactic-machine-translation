'use strict';

module.exports = function(grunt) {
  grunt.initConfig({
    copy: {
      main: {
        files: [
          {expand: true, flatten: true, src: ['dictionary/en.json'], dest: 'demo/dictionary/', filter: 'isFile'},
          {expand: true, flatten: true, src: ['pos-converter/en.json'], dest: 'demo/pos-converter/', filter: 'isFile'},
          {expand: true, flatten: true, src: ['pos-converter/ja.json'], dest: 'demo/pos-converter/', filter: 'isFile'}
        ]
      }
    },

    'gh-pages': {
      options: {
        base: 'demo'
      },
      src: ['**']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-gh-pages');

  grunt.registerTask('deploy', ['copy', 'gh-pages']);
};
