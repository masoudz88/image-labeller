import {AnnotationFormatType} from './enums/AnnotationFormatType';
import {COCOImporter} from '../logic/import/coco/COCOImporter';
import {YOLOImporter} from '../logic/import/yolo/YOLOImporter';
import {VOCImporter} from '../logic/import/voc/VOCImporter';


export const ImporterSpecData = {
    [AnnotationFormatType.COCO]: COCOImporter,
    [AnnotationFormatType.CSV]: undefined,
    [AnnotationFormatType.JSON]: undefined,
    [AnnotationFormatType.VGG]: undefined,
    [AnnotationFormatType.VOC]: VOCImporter,
    [AnnotationFormatType.YOLO]: YOLOImporter
}
