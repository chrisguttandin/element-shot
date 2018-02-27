import { deleteDiffAndRegressionFile } from '../helpers/delete-diff-and-regression-file';
import { IResembleResult } from '../interfaces';

export const toHaveMisMatchWithinRange = (): jasmine.CustomMatcher => {
    return {
        compare (actual: IResembleResult, minimalToleratedMisMatchPercentage: number, maximalToleratedMisMatchPercentage: number) {
            const result: jasmine.CustomMatcherResult = {
                pass: (actual.misMatchPercentage > minimalToleratedMisMatchPercentage &&
                    actual.misMatchPercentage < maximalToleratedMisMatchPercentage)
            };

            if (result.pass) {
                result.message = `Expected the element shot to have a mismatch within the tolerated range from ${ minimalToleratedMisMatchPercentage }% to ${ maximalToleratedMisMatchPercentage }% but it was ${ actual.misMatchPercentage }% instead.`; // tslint:disable-line:max-line-length
            } else {
                result.message = `Expected the element shot to have a mismatch within the tolerated range from ${ minimalToleratedMisMatchPercentage }% to ${ maximalToleratedMisMatchPercentage }% but it was ${ actual.misMatchPercentage }% instead.`; // tslint:disable-line:max-line-length
            }

            if (!actual.isSameDimensions) {
                if (actual.dimensionDifference.height === 0) {
                    result.message += ` The dimensions do differ by a width of ${ actual.dimensionDifference.width }px.`;
                } else if (actual.dimensionDifference.width === 0) {
                    result.message += ` The dimensions do differ by a height of ${ actual.dimensionDifference.height }px.`;
                } else {
                    result.message += ` The dimensions do differ by a height of ${ actual.dimensionDifference.height }px and by a width of ${ actual.dimensionDifference.width }px.`; // tslint:disable-line:max-line-length
                }
            }

            if (result.pass) {
                deleteDiffAndRegressionFile(actual.filename);
            }

            return result;
        }
    };
};
