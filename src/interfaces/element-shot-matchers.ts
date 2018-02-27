import { Locator } from 'protractor';

export interface IElementShotMatchers extends jasmine.Matchers<Locator> {

    not: IElementShotMatchers;

    toBeRegressionFree (): boolean;

    toHaveMismatchLessThan (toleratedMismatchPercentage: number): boolean;

    toHaveMismatchWithinRange (minimalToleratedMismatchPercentage: number, maximalToleratedMismatchPercentage: number): boolean;

}
