import {RectUtil} from '../RectUtil';
import {LineUtil} from '../LineUtil';

describe('LineUtil getCenter method', () => {
    it('should return correct value for horizontal line', () => {
        const givenLine = {
            start: {x: -10, y: 0},
            end: {x: 10, y: 0},
        };
        const expectedPoint = {
            x: 0,
            y: 0
        };
        expect(LineUtil.getCenter(givenLine)).toEqual(expectedPoint);
    });

    it('should return correct value for vertical line', () => {
        const givenLine = {
            start: {x: 1, y: 0},
            end: {x: 1, y: 5},
        };
        const expectedPoint = {
            x: 1,
            y: 2.5
        };
        expect(LineUtil.getCenter(givenLine)).toEqual(expectedPoint);
    });

    it('should return correct value for biased line', () => {
        const givenLine = {
            start: {x: 0, y: 0},
            end: {x: -10, y: -5},
        };
        const expectedPoint = {
            x: -5,
            y: -2.5
        };
        expect(LineUtil.getCenter(givenLine)).toEqual(expectedPoint);
    });

    it('should return null', () => {
        expect(RectUtil.getRatio(null)).toBe(null);
    });
});

describe('LineUtil getDistanceFromLine method', () => {
    it('should return correct value for horizontal line', () => {
        const givenLine = {
            start: {x: -10, y: 0},
            end: {x: 10, y: 0},
        };
        const givenPoint = {
            x: 0,
            y: 3
        };
        const expectedDistance = 3;
        expect(LineUtil.getDistanceFromLine(givenLine, givenPoint)).toBe(expectedDistance);
    });

    it('should return correct value for vertical line', () => {
        const givenLine = {
            start: {x: 1, y: 0},
            end: {x: 1, y: 5},
        };
        const givenPoint = {
            x: 10,
            y: 2.5
        };
        const expectedDistance = 9;
        expect(LineUtil.getDistanceFromLine(givenLine, givenPoint)).toBe(expectedDistance);
    });

    it('should return correct value for biased line', () => {
        const givenLine = {
            start: {x: 0, y: 0},
            end: {x: 8, y: 6},
        };
        const givenPoint = {
            x: 1,
            y: 7
        };
        const expectedDistance = 5;
        expect(LineUtil.getDistanceFromLine(givenLine, givenPoint)).toBe(expectedDistance);
    });

    it('should return null', () => {
        const givenLine = {
            start: {x: 1, y: 0},
            end: {x: 1, y: 0},
        };
        const givenPoint = {
            x: 10,
            y: 2.5
        };

        expect(LineUtil.getDistanceFromLine(givenLine, givenPoint)).toBe(null);
    });
});