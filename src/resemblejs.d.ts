declare module 'resemblejs' {
    export interface IData {
        analysisTime: number;

        dimensionDifference: {
            height: number;

            width: number;
        };

        isSameDimensions: boolean;

        misMatchPercentage: string;

        getBuffer(): Buffer;

        getImageDataUrl(): string;
    }

    export type TCompleteCallback = (data: IData) => void;

    export interface ICompletable {
        onComplete(callback: TCompleteCallback): void;
    }

    export interface IComparable {
        compareTo(fileData: string | Buffer): ICompletable;
    }

    function resemble(fileData: string | Buffer): IComparable;

    export default resemble;
}
