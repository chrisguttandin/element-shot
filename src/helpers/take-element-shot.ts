import { cropToStream } from 'png-crop';
import { Locator, WebElement, browser, element } from 'protractor';
import { IBoundingClientRect } from '../interfaces';

// @todo Wrapping all the promises returned by Protractor is currently necessary to get a native Promise.

// This is not using webElement.getLocation() and webElement.getSize() because they have different results.
const getBoundingClientRect = (webElement: WebElement): Promise<IBoundingClientRect> => new Promise((resolve, reject) => browser
    .executeScript<IBoundingClientRect>('return arguments[0].getBoundingClientRect();', webElement)
    .then(({ height, width, x, y }) => {
        // @todo Limit the number of retries.
        if (height === 0) {
            return setTimeout(() => resolve(getBoundingClientRect(webElement)), 100);
        }

        return resolve({ height, width, x, y });
    }, reject));

const getInnerHeight = (): Promise<number> => new Promise((resolve, reject) => browser
    .executeScript<number>('return innerHeight;')
    .then(resolve, reject));

const getInnerWidth = (): Promise<number> => new Promise((resolve, reject) => browser
    .executeScript<number>('return innerWidth;')
    .then(resolve, reject));

const getScreenshotAsBuffer = (): Promise<Buffer> => new Promise((resolve, reject) => browser
    .takeScreenshot()
    .then((png) => Buffer.from(png, 'base64'))
    .then(resolve, reject));

const getScrollTop = (): Promise<number> => new Promise((resolve, reject) => browser
    .executeScript<number>('return (document.scrollingElement || document.documentElement).scrollTop;')
    .then(resolve, reject));

const scrollElementIntoView = (webElement: WebElement): Promise<void> => new Promise((resolve, reject) => browser
    .executeScript("arguments[0].scrollIntoView({ behavior: 'instant' });", webElement)
    .then(() => resolve(), reject));

export const takeElementShot = (locator: Locator): Promise<Buffer> => {
    const webElement = element(locator)
        .getWebElement();

    return scrollElementIntoView(webElement)
        /*
         * @todo Waiting 300 milliseconds seems to be necessary to fully apply the scrolling. It would be better to somehow detect when the
         * scrolling is done.
         */
        .then(() => new Promise((resolve) => setTimeout(resolve, 300)))
        .then(() => Promise
            .all([
                getBoundingClientRect(webElement),
                getInnerHeight(),
                getInnerWidth(),
                getScreenshotAsBuffer(),
                getScrollTop()
            ]))
        .then(([ boundingClientRect, innerHeight, innerWidth, screenshot, scrollTop ]) => {
            return new Promise<Buffer>((resolve, reject) => {
                const screenShotHeight = screenshot.readUInt32BE(20);
                const screenShotWidth = screenshot.readUInt32BE(16);
                const pixelRatio = (screenShotWidth / innerWidth);

                cropToStream(screenshot, {
                    height: Math.round(boundingClientRect.height) * pixelRatio,
                    left: Math.round(boundingClientRect.x) * pixelRatio,
                    top: (innerHeight === screenShotHeight / pixelRatio) ?
                        Math.round(boundingClientRect.y - scrollTop) * pixelRatio :
                        Math.round(boundingClientRect.y) * pixelRatio,
                    width: Math.round(boundingClientRect.width) * pixelRatio
                }, (err, stream) => {
                    if (err === null) {
                        let buffer = Buffer.alloc(0);

                        stream
                            .on('data', (data) => buffer = Buffer.concat([ buffer, data ], (buffer.length + data.length)))
                            .on('end', () => resolve(buffer))
                            .on('error', (rr) => reject(rr));
                    } else {
                        reject(err);
                    }
                });
            });
        });
};
