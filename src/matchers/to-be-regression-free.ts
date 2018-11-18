import { deleteDiffAndRegressionFile } from '../helpers/delete-diff-and-regression-file';
import { IResembleResult } from '../interfaces';

export const toBeRegressionFree = (): jasmine.CustomMatcher => {
    return {
        compare (actual: IResembleResult): jasmine.CustomMatcherResult {
            const result: jasmine.CustomMatcherResult = { pass: (actual.mismatchPercentage === 0) };

            if (result.pass) {
                result.message = 'Expected the element shot to not be free of any regression.';
            } else {
                result.message = `Expected the element shot to be free of any regression but it has a mismatch of ${ actual.mismatchPercentage }%.`; // tslint:disable-line:max-line-length
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
