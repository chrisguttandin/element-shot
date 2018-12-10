import { browser } from 'protractor';

// @todo Wrapping the promise returned by Protractor is currently necessary to get a native Promise.

export const getBrowserName = (): Promise<number> => new Promise((resolve, reject) => browser
    .getCapabilities()
    .then((capabilities) => capabilities.get('browserName'))
    .then((browserName) => browserName.toLowerCase())
    .then(resolve, reject));
