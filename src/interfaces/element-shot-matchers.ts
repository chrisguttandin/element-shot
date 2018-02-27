import { Locator } from 'protractor';

export interface IElementShotMatchers extends jasmine.Matchers<Locator> {

    not: IElementShotMatchers;

    toBeRegressionFree (number?: number): boolean;

    toHaveMisMatchWithinRange (minimum: number, maximum: number): boolean;

}
