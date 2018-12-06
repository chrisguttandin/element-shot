declare module 'resemblejs' {

    import { PNG } from 'pngjs';

    export interface IData {

        analysisTime: number;

        dimensionDifference: {

            height: number;

            width: number;

        };

        isSameDimensions: boolean;

        misMatchPercentage: string;

        getDiffImage (): PNG;

        getDiffImageAsJPEG (): Buffer;

    }

    export type TCompleteCallback = (data: IData) => void;

    export interface ICompletable {

        onComplete (callback: TCompleteCallback): void;

    }

    export interface IComparable {

        compareTo (fileData: string | Buffer): ICompletable;

    }

    function resemble (fileData: string | Buffer): IComparable;

    export default resemble;

}
