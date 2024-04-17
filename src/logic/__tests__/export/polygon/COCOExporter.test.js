
import { COCOExporter } from "../../../export/polygon/COCOExporter";

describe('COCOExporter produces correct COCO label', () => {
    it('should produce correct info component', () => {
        const givenDescription = "lorem ipsum";
        const expectedCOCOInfo = {
            "description": "lorem ipsum"
        };
        expect(COCOExporter.getInfoComponent(givenDescription)).toEqual(expectedCOCOInfo);
    });

    it('should produce correct categories component', () => {
        const givenLabelNames = [
            {
                "id": "id_1",
                "name": "label_1"
            },
            {
                "id": "id_2",
                "name": "label_2"
            },
            {
                "id": "id_3",
                "name": "label_3"
            }
        ];
        const expectedCOCOCategories = [
            {
                "id": 1,
                "name": "label_1"
            },
            {
                "id": 2,
                "name": "label_2"
            },
            {
                "id": 3,
                "name": "label_3"
            }
        ];
        expect(COCOExporter.getCategoriesComponent(givenLabelNames)).toEqual(expectedCOCOCategories);
    });
});