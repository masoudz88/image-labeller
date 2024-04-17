import {AIActions} from "../../actions/AIActions";

describe('AIActions excludeRejectedLabelNames method', () => {
    it('should return list with correct values', () => {
        // GIVEN
        const suggestedLabels = [
            "label_1",
            "label_2",
            "label_3",
            "label_4",
        ];

        const rejectedLabels = [
            "label_3",
            "label_4",
            "label_5",
        ];

        // WHEN
        const excludedLabels = AIActions.excludeRejectedLabelNames(suggestedLabels, rejectedLabels);

        // THEN
        const expectedLabels = [
            "label_1",
            "label_2",
        ];
        expect(excludedLabels.toString()).toBe(expectedLabels.toString());
    });
});