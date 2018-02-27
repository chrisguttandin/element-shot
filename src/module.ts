import { readFileSync, writeFileSync } from 'fs';
import resemble from 'node-resemble-js';
import { PNG } from 'pngjs';
import { Locator } from 'protractor';
import { getBrowserName } from './helpers/get-browser-name';
import { takeElementShot } from './helpers/take-element-shot';
import { IElementShotMatchers, IResembleResult } from './interfaces';
import { toBeRegressionFree } from './matchers/to-be-regression-free';
import { toHaveMisMatchLessThan } from './matchers/to-have-mis-match-less-than';
import { toHaveMisMatchWithinRange } from './matchers/to-have-mis-match-within-range';

export * from './interfaces';

export const elementShotMatchers: jasmine.CustomMatcherFactories = {
    toBeRegressionFree,
    toHaveMisMatchLessThan,
    toHaveMisMatchWithinRange
};

export const expectElementShot = (result: IResembleResult): IElementShotMatchers => {
    return (<any> expect)(result);
};

export const resembleElementShot = async (locator: Locator, filename: string): Promise<IResembleResult> => {
    const browserName = await getBrowserName();
    const elementShot = await takeElementShot(locator);

    return new Promise<IResembleResult>((resolve, reject) => {
        try {
            const baseline = readFileSync(`${ filename }.${ browserName }.baseline.png`);

            resemble(baseline)
                .compareTo(elementShot)
                .onComplete(({ dimensionDifference, getDiffImage, isSameDimensions, misMatchPercentage }) => {
                    writeFileSync(`${ filename }.${ browserName }.diff.png`, PNG.sync.write(getDiffImage()));
                    writeFileSync(`${ filename }.${ browserName }.regression.png`, elementShot);

                    resolve({
                        dimensionDifference,
                        filename: `${ filename }.${ browserName }`,
                        isSameDimensions,
                        misMatchPercentage: parseFloat(misMatchPercentage)
                    });
                });
        } catch (err) {
            if (err.code === 'ENOENT') {
                // @todo Create the directory in case it is missing.

                writeFileSync(`${ filename }.${ browserName }.baseline.png`, elementShot);

                resolve({
                    dimensionDifference: { height: 0, width: 0 },
                    filename: `${ filename }.${ browserName }`,
                    isSameDimensions: true,
                    misMatchPercentage: 0
                });
            } else {
                reject(err);
            }
        }
    });
};
