import {AnnotationFormatType} from "../../../data/enums/AnnotationFormatType";
import {VGGExporter} from "./VGGExporter";
import {COCOExporter} from "./COCOExporter";

export class PolygonLabelsExporter {
    static export(exportFormatType) {
        switch (exportFormatType) {
            case AnnotationFormatType.VGG:
                VGGExporter.export();
                break;
            case AnnotationFormatType.COCO:
                COCOExporter.export();
                break;
            default:
                return;
        }
    }
}