var path = require('path');
var fs = require('fs');
var _ = require('underscore');

module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-recess');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');


    // Project configuration.
    grunt.initConfig({
        root: require('path').normalize(__dirname),
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
            themes: themes,
            thumbName: 'sumbnail.png'
        }));

        themes.forEach(function (t) {
            grunt.task.run('build:'+t);
        });

    });
    
    grunt.registerTask('default', 'build a theme', function() {
        grunt.task.run('swatch');
    });

    grunt.registerTask('api', 'build api', function() {
        json = {
            categories: getCategoriesJSON(),
            templates: getTemplatesJSON(),
            snippets: getSnippetsJSON(),
            axures: getAxureJSON(),

            psd: [
                {"Bootstrap3": "Bootstrap3"},
                {"Bootstrap3Separately": "Bootstrap3 Separately"}
            ]
        }

        fs.writeFileSync(grunt.config('root') + '/static/api.json', JSON.stringify(json));

        console.log("====== FINISH ======");

        function getAxureJSON() {
            axurePath = grunt.config('root') + '/static/prototyping/axure'

            axureElements = fs.readdirSync(axurePath);

            axureElements = axureElements.filter(function(axureDir) {
                return fs.lstatSync(axurePath + '/' + axureDir).isDirectory() && (fs.existsSync(axurePath + '/' + axureDir + '/info.json'));
            });

            axureElements = axureElements.map(function(axureDir) {
                axureInfo = fs.readFileSync(axurePath + '/' + axureDir + '/info.json');
                try {
                    axureInfo = JSON.parse(axureInfo)
                } catch (e) {
                    throw new Error('can not parse axure' + axureDir + ' json.info');
                }
                axureInfo = _.extend(axureInfo, {
                    slug: axureDir,
                    thumb: '/prototyping/axure/' + axureDir + '/view/thumb.jpg',
                    preview: '/prototyping/axure/' + axureDir + '/view/preview.jpg'
                });
                return axureInfo;
            });

            return axureElements;
        }

        function getSnippetsJSON() {
            var snippetsPath = grunt.config('root') + '/static/snippets';
            var snippetsJSON = []

            snippets = fs.readdirSync(snippetsPath)

            snippets = snippets.filter(function(snippetDir) {
                return fs.lstatSync(snippetsPath + '/' + snippetDir).isDirectory() && (fs.existsSync(snippetsPath + '/' + snippetDir + '/info.json'));
            });

            snippets = snippets.map(function(snippetDir) {
                var infoPath = snippetsPath + '/' + snippetDir + '/info.json'

                var snippetInfo = fs.readFileSync(infoPath);

                try {
                    snippetInfo = JSON.parse(snippetInfo)
                } catch (e) {
                    throw new Error('can not parse snippet' + snippetDir + ' json.info');
                }

                snippetInfo = _.extend(snippetInfo, {
                    slug: snippetDir,
                    csspath: '/snippets/' + snippetDir + '/html/snippet.css',
                    jspath: '/snippets/' + snippetDir + '/html/snippet.js',
                    htmlpath: '/snippets/' + snippetDir + '/html/snippet.html',
                    preview: '/snippets/' + snippetDir + '/view/preview.jpg',
                    thumb: '/snippets/' + snippetDir + '/viewl/thumb.jpg',
                    zip: '/snippets/' + snippetDir + '.zip',
                    index: '/snippets/' + snippetDir + '/html/index.html'
                });

                return snippetInfo;
            });

            return snippets;
        }

        function getTemplatesJSON() {
            var templatesPath = grunt.config('root') + '/static/templates';
            var categories = getCategories()
            var templatesJSON = []

            categories.forEach(function(categoryDir) {
                var templates = fs.readdirSync(templatesPath + '/' + categoryDir)

                templates = templates.filter(function(templateDir) {
                    return fs.lstatSync(templatesPath + '/' + categoryDir + '/' + templateDir).isDirectory();
                });

                templates.forEach(function(templateDir) {
                    var infoPath = templatesPath + '/' + categoryDir + '/' + templateDir + '/info.json'

                    if (!fs.existsSync(infoPath)) {
                        return
                    }

                    templateInfo = fs.readFileSync(infoPath);
                    try {
                        templateInfo = JSON.parse(templateInfo)
                    } catch (e) {
                        throw new Error('can not parse template' + templateDir + ' json.info');
                    }

                    templateInfo = _.extend(templateInfo, {
                        slug: templateDir,
                        categorySlug: categoryDir,
                        preview: '/templates/' + categoryDir + '/' + templateDir + '/view/preview.jpg',
                        zip: '/templates/' + categoryDir + '/' + templateDir + '.zip',
                        index: '/templates/' + categoryDir + '/' + templateDir + '/html/index.html',
                        thumb: '/templates/' + categoryDir + '/' + templateDir + '/view/thumb.jpg'
                    });

                    templatesJSON.push(templateInfo);
                });
            });
            return templatesJSON;
        }

        function getCategoriesJSON() {
            var categories = getCategories()
            var templatesPath = grunt.config('root') + '/static/templates';
            categoriesJSON = categories.map(function(categoryDir) {
                categoryInfo = fs.readFileSync(templatesPath + '/' + categoryDir + '/info.json');
                categoryInfo.slug = categoryDir

                try {
                    categoryInfo = JSON.parse(categoryInfo)
                } catch (e) {
                    throw new Error('can not parse category ' + categoryDir + ' json.info');
                }

                categoryInfo.slug = categoryDir;
                return categoryInfo;
            });

            return categoriesJSON
        }

        function getCategories() {
            var templatesPath = grunt.config('root') + '/static/templates';
            var categories = []

            categories = fs.readdirSync(templatesPath).filter(function(templateDir) {
                return fs.lstatSync(templatesPath + '/' + templateDir).isDirectory() && (fs.existsSync(templatesPath + '/' + templateDir + '/info.json'))
            });

            return categories;
        }
    });
};
