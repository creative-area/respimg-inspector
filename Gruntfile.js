module.exports = function(grunt) {

  "use strict";

  grunt.initConfig({

    // Import package manifest
    pkg: grunt.file.readJSON("package.json"),

    // Banner definitions
    meta: {
      banner: "/*\n" +
        " *	<%= pkg.title || pkg.name %> - v<%= pkg.version %>\n" +
        " *	<%= pkg.description %>\n" +
        " *	<%= pkg.homepage %>\n" +
        " *\n" +
        " *	Made by <%= pkg.author.name %>\n" +
        " *	Under <%= pkg.license %> License\n" +
        " */\n"
    },

    // Concat definitions
    concat: {
      options: {
        banner: "<%= meta.banner %>"
      },
      dist: {
        src: ["src/respimg-inspector.js"],
        dest: "dist/respimg-inspector.js"
      }
    },

    // Lint definitions
    jshint: {
      files: [
        "src/respimg-inspector.js"
      ],
      options: {
        jshintrc: ".jshintrc"
      }
    },

    // Minify definitions
    uglify: {
      dist: {
        files: {
          "dist/respimg-inspector.min.js": ["dist/respimg-inspector.js"]
        }
      },
      options: {
        banner: "<%= meta.banner %>"
      }
    },

    // Replace definitions
    replace: {
      dist: {
        options: {
          patterns: [{
            match: "version",
            replacement: "<%= pkg.version %>"
          }]
        },
        files: [{
          expand: true,
          flatten: true,
          src: ['src/manifest.json'],
          dest: 'dist/'
        }]
      }
    },

    // Copy definitions
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          flatten: true,
          src: [
            "src/respimg-inspector.css",
            "src/icons/*.png",
            "dist/respimg-inspector.js"
          ],
          dest: "dist/"
        }]
      }
    },

    // Clean definitions
    clean: {
      dist: {
        files: [{
          dot: true,
          src: ["dist/*"]
        }]
      }
    },

    // Watch for changes to source
    // (call 'grunt watch')
    watch: {
      files: ["src/*"],
      tasks: ["default"]
    }

  });

  grunt.loadNpmTasks("grunt-contrib-concat");
  grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-replace");

  grunt.registerTask("build", [
    "clean:dist",
    "concat",
    "uglify",
    "replace",
    "copy:dist"
  ]);

  grunt.registerTask("default", [
    "jshint",
    "build"
  ]);

  grunt.registerTask("travis", ["default"]);

};