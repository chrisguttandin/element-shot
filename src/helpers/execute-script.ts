import { browser } from 'protractor';

// @todo Wrapping the promise returned by Protractor is currently necessary to get a native Promise.

/*
 * @todo Retrying up to 5 times is currently necessary to avoid the 'Failed: unknown error: cannot determine loading status from unknown
 * error: unknown sessionId' error which occurs from time to time.
 */

export const executeScript = <T> (script: string, retries = 5, ...args: any[]): Promise<T> => {
    return new Promise<T>((resolve, reject) => {
        browser
            .executeScript<T>(script, ...args)
            .then((result) => resolve(result))
            .catch((err: any) => {
                if (retries > 0) {
                    resolve(executeScript(script, retries - 1));
                } else {
                    reject(err);
                }
            });
    });
};
