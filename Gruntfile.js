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
            },
        },

        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },
            dist: {
                files: {
                    'bundled/app.min.js': 'bundled/app.js',
                }
            },
        },

        less: {
            production: {
                files: {
                    'css/main.css': 'app/main.less'
                }
            },
        },

        cssmin: {
            options: {
                sourceMap: true,
//                report: 'gzip',
                level: 2,
                sourceMapInlineSources: true,
            },
            target: {
                files: {
                    'css/main.min.css': 'css/main.css'
                },
            },
        },

        watch: {
            less: {
                files: 'app/**/*.less',
                tasks: ['less'],
            }
        },
    });

    grunt.registerTask('default', [
        'browserify:bundle',
        'uglify',
        'less:production',
        'cssmin',
    ]);
};
