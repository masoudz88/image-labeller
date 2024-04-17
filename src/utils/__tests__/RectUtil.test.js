import {RectUtil} from '../RectUtil';

describe('RectUtil getRatio method', () => {
    it('should return correct value of rect ratio', () => {
        // given
        const rect = {x: 0, y: 0, width: 10, height: 5};
        // when
        const result = RectUtil.getRatio(rect)
        // then
        expect(result).toBe(2);
    });

    it('should return null', () => {
        expect(RectUtil.getRatio(null)).toBe(null);
    });
});

describe('RectUtil getCenter method', () => {
    it('should return correct center value', () => {
        // given
        const rect = {x: 0, y: 0, width: 10, height: 20};
        const expectedResult = {x: 5, y: 10};
        // when
        const result = RectUtil.getCenter(rect)
        // then
        expect(result).toMatchObject(expectedResult);
    })
})

describe('RectUtil getSize method', () => {
    it('should return correct size value', () => {
        // given
        const rect = {x: 0, y: 0, width: 10, height: 20};
        const expectedSize = {width: 10, height: 20};
        // when
        const result = RectUtil.getSize(rect)
        // then
        expect(result).toMatchObject(expectedSize);
    })
})
