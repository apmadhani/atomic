/*
Atomic
Copyright 2013 LinkedIn

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an "AS
IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
express or implied.   See the License for the specific language
governing permissions and limitations under the License.
*/

// gruntfile.js
var path = require('path');

module.exports = function (grunt) {

  grunt.initConfig({
    output_files: {
      main:         './dist/atomic-__ATOMIC__VERSION__/atomic.js',
      main_min:     './dist/atomic-__ATOMIC__VERSION__/atomic.min.js',
      license:      './dist/atomic-__ATOMIC__VERSION__/LICENSE',
      readme:       './dist/atomic-__ATOMIC__VERSION__/README.md',
      starterPack:  './dist/atomic-__ATOMIC__VERSION__/starter_pack/',
      compat:       './dist/atomic-__ATOMIC__VERSION__/compat/'
    },
    last_output_files: {
      main:         './dist/recent/atomic.js',
      main_min:     './dist/recent/atomic.min.js',
      license:      './dist/recent/LICENSE',
      readme:       './dist/recent/README.md',
      starterPack:  './dist/recent/starter_pack/',
      compat:       './dist/recent/compat/'
    },
    anonymous_header: '!(function(context, undefined){\n',
    anonymous_footer: '\n;context.Atomic.version = "__ATOMIC__VERSION__";\n})(this);',
    pkg: grunt.file.readJSON('package.json'),

    /**
     * clean: clean up temp and artifact directories
     */
    clean: {
      tmp: ['./tmp'],
      dist: ['./dist']
    },

    /**
     * shell: run shell commands. We use this for git ops
     */
    shell: {
      tag: {
        command: 'git describe HEAD',
        options: {
          callback: function (err, stdout, stderr, next) {
            var foot = grunt.config.get('anonymous_footer');
            var output_files = grunt.config.get('output_files');
            var version = stdout.replace(/[\s]/g, '');
            var file;
            var type;

            function addVersion(str) {
              return str.replace(/__ATOMIC__VERSION__/g, version);
            }

            // set the atomic version everywhere we need to
            grunt.config.set('anonymous_footer', addVersion(foot));
            for (type in output_files) {
              file = grunt.config.get('output_files.'+type);
              grunt.config.set('output_files.'+type, addVersion(file));
            }

            next();
          }
        }
      },
      venus: {
        command: ['if [ -e node_modules/venus/bin/venus ] && command -v phantomjs >/dev/null;',
                  'then node ./node_modules/venus/bin/venus run -t "tests/"',
                        '--phantom "./node_modules/phantomjs/lib/phantom/bin/phantomjs"',
                        '--require-annotations;',
                  'else echo "cant find venus in node_modules and/or cant find phantomJS. ',
                             'Run npm install and run npm install -g phantomjs";',
                  'fi'].join(' '),
        options: {
          stdout: true
        }

      },
      venus_browser: {
        command: ['if [ -e node_modules/venus/bin/venus ];',
                  'then node ./node_modules/venus/bin/venus run -t "tests/" --require-annotations;',
                  'else echo "cant find venus in node_modules. Run npm install";',
                  'fi'].join(' '),
        options: {
          stdout: true
        }
      }
    },

    /**
     * copy: copy files that need no modification
     */
    copy: {
      atomic: {
        files: [
          {src: './tmp/atomic.js', dest: '<%=output_files.main %>', filter: 'isFile'},
          {src: './tmp/atomic.min.js', dest: '<%=output_files.main_min %>', filter: 'isFile'},
          {src: './tmp/atomic.js', dest: '<%=last_output_files.main %>', filter: 'isFile'},
          {src: './tmp/atomic.min.js', dest: '<%=last_output_files.main_min %>', filter: 'isFile'}
        ]
      },
      text: {
        files: [
          {src: ['./LICENSE'], dest: '<%= output_files.license %>', filter: 'isFile'},
          {src: ['./README.md'], dest: '<%= output_files.readme %>', filter: 'isFile'},
          {src: ['./LICENSE'], dest: '<%= last_output_files.license %>', filter: 'isFile'},
          {src: ['./README.md'], dest: '<%= last_output_files.readme %>', filter: 'isFile'}
        ]
      },
      starterPack: {
        files: [
          {expand: true, cwd: './starter_pack/', src: ['**'], dest: '<%= output_files.starterPack %>'},
          {expand: true, cwd: './starter_pack/', src: ['**'], dest: '<%= last_output_files.starterPack %>'}
        ]
      },
      compat: {
        files: [
          {expand: true, cwd: './src/compat/', src: ['**'], dest: '<%= output_files.compat %>'},
          {expand: true, cwd: './src/compat/', src: ['**'], dest: '<%= last_output_files.compat %>'}
        ]
      }
    },

    /**
     * jshint: perform jshint operations on the code base
     */
    jshint: {
      all: {
        files: {
          src: [
            './gruntfile.js',
            './examples/scripts/**/*.js',
            './src/atomic/*.js',
            './src/compat/*.js',
            './src/customizable/*.js',
            './starter_pack/**/*.js',
            './src/*.js',
            './tests/src/**/*.js',
            './tests/starter_pack/**/*.js',
            './server.js'
          ]
        },
        jshintrc: './.jshintrc'
      }
    },

    /**
     * uglify: compress code while preserving key identifiers
     */
    uglify: {
      options: {
        // banner: '<%= atomic_header %>\n',
        mangle: {
          except: ['require', 'define', 'Fiber', 'undefined']
        }
      },
      atomic: {
        files: {
          './tmp/atomic.min.js': [ './tmp/atomic.js' ]
        }
      }
    },

    /**
     * includereplace: replace segments of a file with contents of another
     */
    includereplace: {
      atomic: {
        options: {
          prefix: '//@@',
          suffix: ''
        },
        src: './src/atomic.js',
        dest: './tmp'
      }
    },

    /**
     * express: runs our server for examples
     */
    express: {
      server: {
        options: {
          port: 4000,
          debug: true,
          server: path.resolve('./server.js')
        }
      },
      quiet: {
        options: {
          port: 4000,
          debug: false,
          server: path.resolve('./server.js')
        }
      }
    },

    /**
     * remove once running venus properly
     */
    qunit: {
      all: {
        options: {
          timeout: 20000,
          urls: [
            'http://localhost:4000/tests/'
          ]
        }
      }
    },

    wait: {
      server: {
        options: {
          delay: 3
        }
      }
    }
  });

  // load NPM tasks
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-include-replace');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-express');
  // grunt.loadNpmTasks('grunt-contrib-compress');
  // grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-qunit');

  // from https://github.com/gruntjs/grunt/issues/236
  grunt.registerMultiTask('wait', 'Wait for a set amount of time.', function () {
    var delay = this.data.options.delay;
    var d = delay ? delay + ' second' + (delay === '1' ? '' : 's') : 'forever';

    grunt.log.write('Waiting ' + d + '...');

    // Make this task asynchronous. Grunt will not continue processing
    // subsequent tasks until done() is called.
    var done = this.async();

    // If a delay was specified, call done() after that many seconds.
    if (delay) { setTimeout(done, delay * 1000); }
  });

  grunt.registerTask('build', [
    'jshint',
    'shell:tag',
    'includereplace:atomic',
    'uglify:atomic',
    'copy:atomic',
    'copy:text',
    'copy:starterPack',
    'copy:compat',
    'clean:tmp'
  ]);

  // Venus is commented out for now until it has
  // access to hot reload and cleanly scans files
  grunt.registerTask('test', [
    'build',
    'express:quiet',
    'wait:server',
    'qunit:all'
    // shell:venus / shell:venus_browser
  ]);

  grunt.registerTask('itest', [
    'build',
    'server'
  ]);

  grunt.registerTask('server', [
    'express:server',
    'express-keepalive'
  ]);
  // grunt.registerTask('release', []);

  grunt.registerTask('default', ['build']);
};
