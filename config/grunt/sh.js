const { env } = require('process');

module.exports = {
    'build': {
        cmd: 'tsc -p src/tsconfig.json'
    },
    'lint': {
        cmd: 'tslint --config config/tslint/src.json --project src/tsconfig.json src/*.ts src/**/*.ts'
    },
    'test-e2e': {
        cmd: (env.TRAVIS) ?
            'protractor config/protractor/config.js' :
            'webdriver-manager update && protractor config/protractor/config.js'
    },
    'test-integration': {
        cmd: 'mocha --bail --recursive --require config/mocha/config-integration.js test/integration'
    }
};
