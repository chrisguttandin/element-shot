import { Locator } from 'protractor';

export interface IElementShotMatchers extends jasmine.Matchers<Locator> {

    not: IElementShotMatchers;

    toBeRegressionFree (): boolean;

    toHaveMisMatchLessThan (toleratedMisMatchPercentage: number): boolean;

    toHaveMisMatchWithinRange (minimalToleratedMisMatchPercentage: number, maximalToleratedMisMatchPercentage: number): boolean;

}
