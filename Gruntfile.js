var path = require('path');
var fs = require('fs');
var _ = require('underscore');

module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');


    // Project configuration.
    grunt.initConfig({
        root: require('path').normalize(__dirname),
        pkg: grunt.file.readJSON('package.json'),
        concat: {
          options: {
            banner: '',
            stripBanners: false
          },
          dist: {
            src: [],
            dest: ''
          }
        },
        clean: {
          build: {
            src: ['static/themes/*/build.less', '!static/themes/global/build.less']
          }
        },
        less: {
            dist: {
                options: {
                    compile: true,
                    compress: false
                },
                files: {}
            }
        }
    });

    grunt.registerTask('theme', 'build theme', function(theme) {
        var concatSrc;
        var concatDest;
        var lessDest;
        var lessSrc;
        var files = {};
        var dist = {};

        concatSrc = 'static/themes/global/build.less';
        concatDest = 'static/themes/' + theme + '/build.less';
        lessSrc = [ 'static/themes/' + theme + '/build.less' ];
        lessDest = 'static/themes/' + theme + '/bootstrap.css';

        dist = {src: concatSrc, dest: concatDest};
        grunt.config('concat.dist', dist);
        files = {}; files[lessDest] = lessSrc;
        grunt.config('less.dist.files', files);
        grunt.task.run(['concat', 'less:dist', 'clean']);

    });

    grunt.registerTask('api', 'build api', function() {
        json = {
            categories: getCategoriesJSON(),
            templates: getTemplatesJSON(),
            snippets: getSnippetsJSON(),
            axures: getAxureJSON(),
            themes: getThemesJSON(),

            psd: [
                {"Bootstrap3": "Bootstrap3"},
                {"Bootstrap3Separately": "Bootstrap3 Separately"}
            ]
        }

        fs.writeFileSync(grunt.config('root') + '/static/api.json', JSON.stringify(json));

        console.log("====== FINISH ======");

        function getThemesJSON () {
            themesPath = grunt.config('root') + '/static/themes'

            themesElements = fs.readdirSync(themesPath);

            themesElements = themesElements.filter(function(themeDir) {
                return fs.lstatSync(themesPath + '/' + themeDir).isDirectory() && (fs.existsSync(themesPath + '/' + themeDir + '/info.json'));
            });

            themesElements = themesElements.map(function(themeDir) {
                themeInfo = fs.readFileSync(themesPath + '/' + themeDir + '/info.json');
                try {
                    themeInfo = JSON.parse(themeInfo)
                } catch (e) {
                    throw new Error('can not parse theme ' + themeDir + ' json.info');
                }
                themeInfo = _.extend(themeInfo, {
                    slug: themeDir,
                    thumb: '/themes/' + themeDir + '/view/thumb.jpg',
                    preview: '/themes/' + themeDir + '/view/preview.jpg',
                    css: '/themes/' + themeDir + '/bootstrap.css',
                    variables: '/themes/' + themeDir + '/variables.less',
                    index: '/themes/' + themeDir + '/index.html'
                });
                return themeInfo;
            });
            return themesElements;
        }

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
                    preview: '/prototyping/axure/' + axureDir + '/view/preview.jpg',
                    zip: '/prototyping/axure/' + axureDir + '.zip'
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
                    thumb: '/snippets/' + snippetDir + '/view/thumb.jpg',
                    zip: '/snippets/' + snippetDir + '.zip',
                    html: fs.readFileSync('./static/snippets/' + snippetDir + '/html/snippet.html').toString(),
                    css: fs.readFileSync('./static/snippets/' + snippetDir + '/html/snippet.css').toString(),
                    js: fs.readFileSync('./static/snippets/' + snippetDir + '/html/snippet.js').toString(),
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
                        thumb: '/templates/' + categoryDir + '/' + templateDir + (templateInfo.partner? '' : '/view') + '/thumb.jpg'
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
