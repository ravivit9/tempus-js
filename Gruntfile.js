module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        docular: {
            groups: [
                {
                    groupTitle: 'Docs',
                    groupId: 'docs',
                    groupIcon: 'icon-book',
                    sections: [
                        {
                            id: "tempus",
                            title: "Tempus",
                            scripts: [
                                "src/tempus.js"
                            ],
                            docs: [],
                            rank : {}
                        }
                    ]
                }
            ],
            showDocularDocs: false,
            showAngularDocs: false
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= pkg.version %> <%= pkg.author %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'src/<%= pkg.name %>.js',
                dest: 'min/<%= pkg.name %>.min.js'
            }
        }
    });
    grunt.loadNpmTasks('grunt-docular');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    // Default task(s).
    grunt.registerTask('default', ['docular', 'uglify']);

};