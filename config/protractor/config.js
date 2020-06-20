const { env } = require('process');

// eslint-disable-next-line padding-line-between-statements
const chromeCapabilities = {
    browserName: 'chrome',
    chromeOptions: {
        args: ['--device-scale-factor=2', '--disable-gpu', '--force-device-scale-factor=2', '--headless', '--window-size=1024,768']
    }
};

module.exports.config = {
    directConnect: !!env.TRAVIS,

    framework: 'jasmine',

    multiCapabilities: env.TRAVIS ? [chromeCapabilities] : [chromeCapabilities, { browserName: 'safari' }],

    specs: ['../../test/e2e/**/*.js']
};
