module.exports = function (grunt) {
    grunt.initConfig({
        ts: {
            options: {
                comments: true
            },
            default: {
                tsconfig: './tsconfig.json',
                src: [
                    './TelemetryValidation/*.ts',
                    './*.ts'
                ]
            },
            test: {
                tsconfig: './Tests/tsconfig.json',
                src: [
                    './Tests/Selenium/*.ts',
                    './Tests/*.ts',
                ],
                out: 'Tests/Selenium/aichannel.tests.js'
            }
        },
        qunit: {
            channel: {
                options: {
                    urls: [
                        './Tests/Selenium/Tests.html'                       
                    ],
                    timeout: 300 * 1000, // 5 min
                    console: false,
                    summaryOnly: true,
                    '--web-security': 'false'
                }
            }
        }
    });

    grunt.event.on('qunit.testStart', function (name) {
        grunt.log.ok('Running test: ' + name);
    });

    grunt.loadNpmTasks("grunt-ts");
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.registerTask("default", ["ts:default"]);
    grunt.registerTask("test", ["ts:default", "ts:test", "qunit:channel"]);
};