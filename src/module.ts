import { readFileSync, writeFileSync } from 'fs';
import { Locator } from 'protractor';
import resemble from 'resemblejs';
import { getBrowserName } from './helpers/get-browser-name';
import { takeElementShot } from './helpers/take-element-shot';
import { IElementShotMatchers, IResembleResult } from './interfaces';
import { toBeRegressionFree } from './matchers/to-be-regression-free';
import { toHaveMismatchLessThan } from './matchers/to-have-mismatch-less-than';
import { toHaveMismatchWithinRange } from './matchers/to-have-mismatch-within-range';

/*
 * @todo Explicitly referencing the barrel file seems to be necessary when enabling the
 * isolatedModules compiler option.
 */
export * from './interfaces/index';

export const elementShotMatchers: jasmine.CustomMatcherFactories = {
    toBeRegressionFree,
    toHaveMismatchLessThan,
    toHaveMismatchWithinRange
};

export const expectElementShot = (result: IResembleResult): IElementShotMatchers => {
    return (<any>expect)(result);
};

export const resembleElementShot = async (locator: Locator, filename: string): Promise<IResembleResult> => {
    const browserName = await getBrowserName();
    const elementShot = await takeElementShot(locator);

    return new Promise<IResembleResult>((resolve, reject) => {
        try {
            const baseline = readFileSync(`${filename}.${browserName}.baseline.png`);

            resemble(baseline)
                .compareTo(elementShot)
                .onComplete(({ dimensionDifference, getBuffer, isSameDimensions, misMatchPercentage }) => {
                    writeFileSync(`${filename}.${browserName}.diff.png`, getBuffer());
                    writeFileSync(`${filename}.${browserName}.regression.png`, elementShot);

                    resolve({
                        dimensionDifference,
                        filename: `${filename}.${browserName}`,
                        isSameDimensions,
                        mismatchPercentage: parseFloat(misMatchPercentage)
                    });
                });
        } catch (err) {
            if (err.code === 'ENOENT') {
                // @todo Create the directory in case it is missing.

                writeFileSync(`${filename}.${browserName}.baseline.png`, elementShot);

                resolve({
                    dimensionDifference: { height: 0, width: 0 },
                    filename: `${filename}.${browserName}`,
                    isSameDimensions: true,
                    mismatchPercentage: 0
                });
            } else {
                reject(err);
            }
        }
    });
};
