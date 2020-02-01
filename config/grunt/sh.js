module.exports = (grunt) => {
    const fix = (grunt.option('fix') === true);

    return {
        'build': {
            cmd: 'tsc --project src/tsconfig.json'
        },
        'lint-config': {
            cmd: `eslint --config config/eslint/config.json --ext .js ${ (fix) ? '--fix ' : '' }--report-unused-disable-directives *.js config/`
        },
        'lint-src': {
            cmd: 'tslint --config config/tslint/src.json --project src/tsconfig.json src/*.ts src/**/*.ts'
        },
        'lint-test': {
            cmd: `eslint --config config/eslint/test.json --ext .js ${ (fix) ? '--fix ' : '' }--report-unused-disable-directives test/`
        },
        'test-e2e': {
            cmd: 'webdriver-manager update --gecko false && protractor config/protractor/config.js'
        },
        'test-integration': {
            cmd: 'mocha --bail --recursive --require config/mocha/config-integration.js test/integration'
        }
    };
};
