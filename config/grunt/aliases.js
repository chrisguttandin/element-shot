const { env } = require('process');

// eslint-disable-next-line padding-line-between-statements
const filter = (predicate, ...tasks) => (predicate ? tasks : []);
const isType = (...types) => env.TYPE === undefined || types.includes(env.TYPE);

module.exports = {
    build: ['clean:build', 'sh:build', 'babel:build'],
    lint: ['sh:lint-config', 'sh:lint-src', 'sh:lint-test'],
    test: ['build', ...filter(isType('e2e'), 'sh:test-e2e'), ...filter(isType('integration'), 'sh:test-integration')]
};
