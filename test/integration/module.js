import { expectElementShot, resembleElementShot } from '../../src/module';

describe('element-shot', () => {

    describe('expectElementShot()', () => {

        it('should be a function', () => {
            expect(expectElementShot).to.be.a('function');
        });

    });

    describe('resembleElementShot()', () => {

        it('should be a function', () => {
            expect(resembleElementShot).to.be.a('function');
        });

    });

});
