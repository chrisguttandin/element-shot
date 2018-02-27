import { cropToStream } from 'png-crop';
import { Locator, WebElement, browser, element } from 'protractor';

// @todo Wrapping all the promises returned by Protractor is currently necessary to get a native Promise.

const getInnerHeight = (): Promise<number> => new Promise((resolve, reject) => browser
    .executeScript<number>('return innerHeight;')
    .then(resolve, reject));

const getInnerWidth = (): Promise<number> => new Promise((resolve, reject) => browser
    .executeScript<number>('return innerWidth;')
    .then(resolve, reject));

const getLocation = (webElement: WebElement): Promise<{ x: number, y: number }> => new Promise((resolve, reject) => webElement
    .getLocation()
    .then(resolve, reject));

const getScreenshotAsBuffer = (): Promise<Buffer> => new Promise((resolve, reject) => browser
    .takeScreenshot()
    .then((png) => Buffer.from(png, 'base64'))
    .then(resolve, reject));

const getScrollTop = (): Promise<number> => new Promise((resolve, reject) => browser
    .executeScript<number>('return (document.scrollingElement || document.documentElement).scrollTop;')
    .then(resolve, reject));

const getSize = (webElement: WebElement): Promise<{ height: number, width: number }> => new Promise((resolve, reject) => webElement
    .getSize()
    .then((size) => {
        // @todo Limit the number of retries.
        if (size.height === 0) {
            return setTimeout(() => resolve(getSize(webElement)), 100);
        }

        return resolve(size);
    }, reject));

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
                getInnerHeight(),
                getInnerWidth(),
                getLocation(webElement),
                getSize(webElement),
                getScreenshotAsBuffer(),
                getScrollTop()
            ]))
        .then(([ innerHeight, innerWidth, location, size, screenshot, scrollTop ]) => {
            return new Promise<Buffer>((resolve, reject) => {
                const screenShotHeight = screenshot.readUInt32BE(20);
                const screenShotWidth = screenshot.readUInt32BE(16);
                const pixelRatio = (screenShotWidth / innerWidth);

                cropToStream(screenshot, {
                    height: Math.round(size.height * pixelRatio),
                    left: Math.round(location.x * pixelRatio),
                    top: Math.round((innerHeight === screenShotHeight / pixelRatio) ?
                        ((location.y * pixelRatio) - (scrollTop * pixelRatio)) :
                        (location.y * pixelRatio)),
                    width: Math.round(size.width * pixelRatio)
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
