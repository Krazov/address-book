module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        browserify: {
            bundle: {
                files: {
                    'bundled/app.js': 'app/main.js'
                },
                options: {
                    transform: [['babelify', {
                        presets: 'env'
                    }]],
                    browserifyOptions: {
                        debug: true
                    }
                }
            }
        },

        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },
            dist: {
                files: {
                    'bundled/app.min.js': 'bundled/app.js'
                }
            }
        },
    });

    grunt.registerTask('default', [
        'browserify:bundle',
        'uglify',
    ]);
};
