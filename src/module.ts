import { readFileSync, unlinkSync, writeFileSync } from 'fs';
import resemble from 'node-resemble-js';
import { PNG } from 'pngjs';
import { Locator } from 'protractor';
import { getBrowserName } from './helpers/get-browser-name';
import { takeElementShot } from './helpers/take-element-shot';
import { IElementShotMatchers, IResembleResult } from './interfaces';

export * from './interfaces';

export const elementShotMatchers: jasmine.CustomMatcherFactories = {
    toBeRegressionFree (): jasmine.CustomMatcher {
        return {
            compare (actual: IResembleResult, toleratedMisMatchPercentage = 0) {
                const result: jasmine.CustomMatcherResult = { pass: (actual.misMatchPercentage <= toleratedMisMatchPercentage) };

                if (result.pass) {
                    result.message = (toleratedMisMatchPercentage === 0) ?
                        'Expected the element shot to not be free of any regression.' :
                        `Expected the element shot to have a mismatch above the tolerated value of ${ toleratedMisMatchPercentage }% but it was ${ actual.misMatchPercentage }% instead.`; // tslint:disable-line:max-line-length
                } else {
                    result.message = (toleratedMisMatchPercentage === 0) ?
                        `Expected the element shot to be free of any regression but it has a mismatch of ${ actual.misMatchPercentage }%.` : // tslint:disable-line:max-line-length
                        `Expected the element shot to have a mismatch below the tolerated value of ${ toleratedMisMatchPercentage }% but it was ${ actual.misMatchPercentage }% instead.`; // tslint:disable-line:max-line-length
                }

                if (result.pass) {
                    try {
                        unlinkSync(`${ actual.filename }.diff.png`);
                    } catch (err) {
                        if (err.code !== 'ENOENT') {
                            throw err;
                        }
                    }

                    try {
                        unlinkSync(`${ actual.filename }.regression.png`);
                    } catch (err) {
                        if (err.code !== 'ENOENT') {
                            throw err;
                        }
                    }
                }

                return result;
            }
        };
    }
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
