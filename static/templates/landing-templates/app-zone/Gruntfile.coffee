module.exports = (grunt) ->
    grunt.initConfig
        recess:
            bootstrap:
                options:
                    compile: true
                files:
                    'html/css/bootstrap.css': ['bootstrap/less/bootstrap.custom.less']

        watch:
            bootstrap:
                files: ['bootstrap/less/**/*.less']
                tasks: ['recess:bootstrap']
                options:
                    spawn: false

    grunt.loadNpmTasks 'grunt-recess'
    grunt.loadNpmTasks 'grunt-contrib-watch'

    grunt.registerTask 'default', ['recess', 'watch']

    grunt.registerTask 'build', ['recess:bootstrap', 'compress:html/css/bootstrap.css:html/css/bootstrap.min.css']

    grunt.registerTask 'compress', 'compress a generic css', (fileSrc, fileDst) ->
        files = {}
        files[fileDst] = fileSrc

        grunt.log.writeln "compressing file #{fileSrc}"

        grunt.config 'recess.bootstrap.files', files
        grunt.config 'recess.bootstrap.options.compress', true
        grunt.task.run ['recess:bootstrap']

