import {LabelType} from './enums/LabelType';
import {AnnotationFormatType} from './enums/AnnotationFormatType';

export const ImportFormatData = {
    [LabelType.RECT]: [
        {
            type: AnnotationFormatType.COCO,
            label: 'Single file in COCO JSON format.'
        },
        {
            type: AnnotationFormatType.YOLO,
            label: 'Multiple files in YOLO format along with labels names definition - labels.txt file.'
        },
        {
            type: AnnotationFormatType.VOC,
            label: 'Multiple files in VOC XML format.'
        }
    ],
    [LabelType.POINT]: [],
    [LabelType.LINE]: [],
    [LabelType.POLYGON]: [
        {
            type: AnnotationFormatType.COCO,
            label: 'Single file in COCO JSON format.'
        }
    ],
    [LabelType.IMAGE_RECOGNITION]: []
}
