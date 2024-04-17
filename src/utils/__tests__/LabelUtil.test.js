import { LabelUtil } from '../LabelUtil';
import {LabelStatus} from '../../data/enums/LabelStatus';

const mockUUID = '123e4567-e89b-12d3-a456-426614174000'

jest.mock('uuid', () => ({ v4: () => mockUUID }));

describe('LabelUtil createLabelRect method', () => {
    it('return correct LabelRect object', () => {
        // given
        const labelId = '1';
        const rect = {
            x: 100,
            y: 100,
            width: 100,
            height: 100
        };

        // when
        const result = LabelUtil.createLabelRect(labelId, rect);

        // then
        const expectedResult = {
            id: mockUUID,
            labelId,
            rect,
            isVisible: true,
            isCreatedByAI: false,
            status: LabelStatus.ACCEPTED,
            suggestedLabel: null
        }
        expect(result).toEqual(expectedResult);
    });
});

describe('LabelUtil createLabelPolygon method', () => {
    it('return correct LabelPolygon object', () => {
        // given
        const labelId = '1';
        const vertices = [
            {
                x: 100,
                y: 100
            },
            {
                x: 100,
                y: 200
            },
            {
                x: 200,
                y: 100
            }
        ];

        // when
        const result = LabelUtil.createLabelPolygon(labelId, vertices);

        // then
        const expectedResult = {
            id: mockUUID,
            labelId,
            vertices,
            isVisible: true
        }
        expect(result).toEqual(expectedResult);
    });
});

describe('LabelUtil createLabelPoint method', () => {
    it('return correct LabelPoint object', () => {
        // given
        const labelId = '1';
        const point = {
            x: 100,
            y: 100
        };

        // when
        const result = LabelUtil.createLabelPoint(labelId, point);

        // then
        const expectedResult = {
            id: mockUUID,
            labelId,
            point,
            isVisible: true,
            isCreatedByAI: false,
            status: LabelStatus.ACCEPTED,
            suggestedLabel: null
        }
        expect(result).toEqual(expectedResult);
    });
});
