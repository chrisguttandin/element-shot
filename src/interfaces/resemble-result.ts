export interface IResembleResult {

    dimensionDifference: {

        height: number;

        width: number;

    };

    filename: string;

    isSameDimensions: boolean;

    mismatchPercentage: number;

}
