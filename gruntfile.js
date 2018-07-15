module.exports = function (grunt) {
    grunt.initConfig({
        ts: {
            options: {
                comments: true
            },
            channelcjs: {
                tsconfig: './cjs/tsconfigcommonjs.json',
                src: [
                    './TelemetryValidation/*.ts',
                    './*.ts'
                ]
            },
            channel: {
                tsconfig: './tsconfig.json',
                src: [
                    './TelemetryValidation/*.ts',
                    './*.ts'
                ],
                out: './amd/bundle/applicationinsights-channel-js.js',
            },
            test: {
                tsconfig: './tsconfig.json',
                src: [
                    './Tests/Selenium/*.ts'
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
    grunt.registerTask("channel", ["ts:channel"]);
    grunt.registerTask("channelcjs", ["ts:channelcjs"])
    grunt.registerTask("test", ["ts:channel", "ts:test", "qunit:channel"]);
};