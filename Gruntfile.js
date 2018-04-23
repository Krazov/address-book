module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
//        uglify: {
//            options: {
//                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
//            },
//            dist: {
//                files: {
//                    'bundled/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
//                }
//            }
//        },
        browserify: {
            dist: {
                files: {
                    // destination for transpiled js : source js
                    'bundled/app.js': 'app/main.js'
                },
                options: {
                    transform: [['babelify', {
                        presets: 'es2015'
                    }]],
                    browserifyOptions: {
                        debug: true
                    }
                }
            }
        }
    });

    grunt.registerTask('default', [
        'browserify:dist'
//        'uglify',
    ]);
};
