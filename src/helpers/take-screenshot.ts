import { browser } from 'protractor';

// @todo Wrapping the promise returned by Protractor is currently necessary to get a native Promise.

/*
 * @todo Retrying up to 5 times is currently necessary to avoid the 'Failed: unknown error: cannot determine loading status from unknown
 * error: unknown sessionId' error which occurs from time to time.
 */

export const takeScreenshot = (retries = 5): Promise<string> => {
    return new Promise((resolve, reject) => {
        browser
            .takeScreenshot()
            .then((result) => resolve(result))
            .catch((err) => {
                if (retries > 0) {
                    resolve(takeScreenshot(retries - 1));
                } else {
                    reject(err);
                }
            });
    });
};
