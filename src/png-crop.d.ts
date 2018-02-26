declare module 'png-crop' {

    import { Buffer } from 'buffer';
    import { ReadStream } from 'fs';

    export type TErrorCallbackFunction = (err: Error) => void;

    export type TSuccessCallbackFunction = (err: null, stream: ReadStream) => void;

    export type TCallbackFunction = TErrorCallbackFunction | TSuccessCallbackFunction;

    export interface IConfiguration {

        height: null | number;

        left?: number;

        top?: number;

        width: null | number;

    }

    export function crop (
        streamOrBufOrPath: string | Buffer | ReadStream,
        destPath: string,
        config: IConfiguration,
        done: TCallbackFunction
    ): void;

    export function cropToStream (streamOrBufOrPath: string | Buffer | ReadStream, config: IConfiguration, done: TCallbackFunction): void;

}
