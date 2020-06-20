const { resolve } = require('path');
const { browser, by } = require('protractor');
const { elementShotMatchers, expectElementShot, resembleElementShot } = require('../../build/node/module');

describe('boxes', () => {
    beforeEach(() => {
        jasmine.addMatchers(elementShotMatchers); // eslint-disable-line no-undef

        browser.ignoreSynchronization = true;

        browser.get(`file://${resolve(__dirname, '../..')}/test/fixtures/boxes.html`);
    });

    describe('gray box', () => {
        it('should look the same', async () => {
            const result = await resembleElementShot(by.id('gray-box'), 'test/screenshots/gray-box');

            expectElementShot(result).toBeRegressionFree();
        });
    });

    describe('gray box with black dot', () => {
        it('should look the same', async () => {
            const result = await resembleElementShot(by.id('gray-box-with-black-dot'), 'test/screenshots/gray-box-with-black-dot');

            expectElementShot(result).toBeRegressionFree();
        });

        it('should not look exactly like the gray box', async () => {
            const result = await resembleElementShot(by.id('gray-box-with-black-dot'), 'test/screenshots/gray-box');

            expectElementShot(result).not.toBeRegressionFree();
        });

        it('should look almost like the gray box', async () => {
            const result = await resembleElementShot(by.id('gray-box-with-black-dot'), 'test/screenshots/gray-box');

            expectElementShot(result).toHaveMismatchLessThan(2);
        });

        it('should look almost like the gray box', async () => {
            const result = await resembleElementShot(by.id('gray-box-with-black-dot'), 'test/screenshots/gray-box');

            expectElementShot(result).toHaveMismatchWithinRange(0.5, 1.5);
        });
    });
});
