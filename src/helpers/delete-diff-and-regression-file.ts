import { unlinkSync } from 'fs';

export const deleteDiffAndRegressionFile = (filename: string): void => {
    try {
        unlinkSync(`${ filename }.diff.png`);
    } catch (err) {
        if (err.code !== 'ENOENT') {
            throw err;
        }
    }

    try {
        unlinkSync(`${ filename }.regression.png`);
    } catch (err) {
        if (err.code !== 'ENOENT') {
            throw err;
        }
    }
};
