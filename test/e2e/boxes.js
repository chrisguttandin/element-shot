const { resolve } = require('path');
const { browser, by } = require('protractor');
const { elementShotMatchers, expectElementShot, resembleElementShot } = require('../../build/node/module');

describe('boxes', () => {

    beforeEach(() => {
        jasmine.addMatchers(elementShotMatchers); // eslint-disable-line no-undef

        browser.ignoreSynchronization = true;

        browser.get(`file://${ resolve(__dirname, '../..') }/test/fixtures/boxes.html`);
    });

    describe('red box', () => {

        it('should look the same', async () => {
            const result = await resembleElementShot(by.id('red-box'), 'test/screenshots/red-box');

            expectElementShot(result).toBeRegressionFree();
        });

    });

    describe('red box with blue dot', () => {

        it('should look the same', async () => {
            const result = await resembleElementShot(by.id('red-box-with-blue-dot'), 'test/screenshots/red-box-with-blue-dot');

            expectElementShot(result).toBeRegressionFree();
        });

        it('should not look exactly like the red box', async () => {
            const result = await resembleElementShot(by.id('red-box-with-blue-dot'), 'test/screenshots/red-box');

            expectElementShot(result).not.toBeRegressionFree();
        });

        it('should look the almost like the red box', async () => {
            const result = await resembleElementShot(by.id('red-box-with-blue-dot'), 'test/screenshots/red-box');

            expectElementShot(result).toHaveMismatchLessThan(2);
        });

        it('should look the almost like the red box', async () => {
            const result = await resembleElementShot(by.id('red-box-with-blue-dot'), 'test/screenshots/red-box');

            expectElementShot(result).toHaveMismatchWithinRange(0.5, 1.5);
        });

    });

});
