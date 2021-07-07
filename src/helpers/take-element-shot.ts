import { cropToStream } from 'png-crop';
import { Locator, WebElement, element } from 'protractor';
import { IBoundingClientRect } from '../interfaces';
import { executeScript } from './execute-script';
import { takeScreenshot } from './take-screenshot';

// This is not using webElement.getLocation() and webElement.getSize() because they have different results.
const getBoundingClientRect = (webElement: WebElement): Promise<IBoundingClientRect> => {
    return executeScript<IBoundingClientRect>('return arguments[0].getBoundingClientRect();', 5, webElement).then(
        ({ height, width, x, y }) => {
            // @todo Limit the number of retries.
            if (height === 0) {
                return new Promise<IBoundingClientRect>((resolve) => setTimeout(() => resolve(getBoundingClientRect(webElement)), 100));
            }

            return { height, width, x, y };
        }
    );
};

const getInnerHeight = (): Promise<number> => executeScript<number>('return innerHeight;');

const getInnerWidth = (): Promise<number> => executeScript<number>('return innerWidth;');

const getScreenshotAsBuffer = async (): Promise<Buffer> => {
    const png = await takeScreenshot();

    return Buffer.from(png, 'base64');
};

const getScrollTop = (): Promise<number> => {
    return executeScript<number>('return (document.scrollingElement || document.documentElement).scrollTop;');
};

const scrollElementIntoView = (webElement: WebElement): Promise<void> => {
    return executeScript("arguments[0].scrollIntoView({ behavior: 'instant' });", 5, webElement);
};

export const takeElementShot = (locator: Locator): Promise<Buffer> => {
    const webElement = element(locator).getWebElement();

    return (
        scrollElementIntoView(webElement)
            /*
             * @todo Waiting 300 milliseconds seems to be necessary to fully apply the scrolling. It would be better to somehow detect when the
             * scrolling is done.
             */
            .then(() => new Promise<void>((resolve) => setTimeout(resolve, 300)))
            .then(() =>
                Promise.all([getBoundingClientRect(webElement), getInnerHeight(), getInnerWidth(), getScreenshotAsBuffer(), getScrollTop()])
            )
            .then(([boundingClientRect, innerHeight, innerWidth, screenshot, scrollTop]) => {
                return new Promise<Buffer>((resolve, reject) => {
                    const screenShotHeight = screenshot.readUInt32BE(20);
                    const screenShotWidth = screenshot.readUInt32BE(16);
                    const pixelRatio = screenShotWidth / innerWidth;

                    cropToStream(
                        screenshot,
                        {
                            height: Math.round(boundingClientRect.height) * pixelRatio,
                            left: Math.round(boundingClientRect.x) * pixelRatio,
                            top:
                                innerHeight === screenShotHeight / pixelRatio
                                    ? Math.round(boundingClientRect.y) * pixelRatio
                                    : Math.round(boundingClientRect.y + scrollTop) * pixelRatio,
                            width: Math.round(boundingClientRect.width) * pixelRatio
                        },
                        (err, stream) => {
                            if (err === null) {
                                let buffer = Buffer.alloc(0);

                                stream
                                    .on('data', (data: Buffer) => (buffer = Buffer.concat([buffer, data], buffer.length + data.length)))
                                    .on('end', () => resolve(buffer))
                                    .on('error', (rr: Error) => reject(rr));
                            } else {
                                reject(err);
                            }
                        }
                    );
                });
            })
    );
};
