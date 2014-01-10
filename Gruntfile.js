var path = require('path')
var fs = require('fs')

module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-recess');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        builddir: '.',
        meta: {
            banner: '/**\n' +
                        ' * <%= pkg.description %>\n' +
                        ' * @version v<%= pkg.version %> - ' +
                        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
                        ' * @link <%= pkg.homepage %>\n' +
                        ' * @license <%= pkg.license %>' + ' */'
        },
        swatch: {
            amelia:{}, test_theme: {}
        },
        clean: {
            build: {
                src: ['static/themes/*/build.less', '!global_theme/build.less']
            }
        },
        concat: {
            dist: {
                src: [],
                dest: ''
            }
        },
        recess: {
            dist: {
                options: {
                    compile: true,
                    compress: false
                },
                files: {}
            }
        }
    });

    grunt.registerTask('none', function() {});

    grunt.registerTask('build', 'build a regular theme', function(theme, compress) {
        var compress = compress == undefined ? true : compress;

        var concatSrc;
        var concatDest;
        var recessDest;
        var recessSrc;
        var files = {};
        var dist = {};

        concatSrc = 'global_theme/build.less';
        concatDest = 'static/themes/' + theme + '/build.less';
        recessDest = '<%=builddir%>/static/themes/' + theme + '/bootstrap.css';
        recessSrc = [ 'static/themes/' + theme + '/' + 'build.less' ];

        dist = {src: concatSrc, dest: concatDest};
        grunt.config('concat.dist', dist);
        files = {}; files[recessDest] = recessSrc;
        
        grunt.config('recess.dist.files', files);
        grunt.config('recess.dist.options.compress', false);

        grunt.task.run(['concat', 'recess:dist', 'clean:build',
            compress ? 'compress:'+recessDest+':'+'<%=builddir%>/static/themes/' + theme + '/bootstrap.min.css':'none']);
    });

    grunt.registerTask('compress', 'compress a generic css', function(fileSrc, fileDst) {
        var files = {}; files[fileDst] = fileSrc;
        grunt.log.writeln('compressing file ' + fileSrc);

        grunt.config('recess.dist.files', files);
        grunt.config('recess.dist.options.compress', true);
        grunt.task.run(['recess:dist']);
    });

    grunt.registerTask('swatch', 'build a theme', function() {
        var themes = fs.readdirSync(grunt.config('builddir') + '/static/themes')

        grunt.file.write(grunt.config('builddir') + '/static/api.json', JSON.stringify({
            themes: themes
        }));

        themes.forEach(function (t) {
            grunt.task.run('build:'+t);
        });

    });
    
    grunt.registerTask('default', 'build a theme', function() {
        grunt.task.run('swatch');
    });
};
