import {AnnotationFormatType} from "../../data/enums/AnnotationFormatType";
import {ImageRepository} from "../imageRepository/ImageRepository";
import {LabelsSelector} from "../../store/selectors/LabelsSelector";
import {ExporterUtil} from "../../utils/ExporterUtil";
import {findLast} from "lodash";

export class PointLabelsExporter {
    static export(exportFormatType) {
        switch (exportFormatType) {
            case AnnotationFormatType.CSV:
                PointLabelsExporter.exportAsCSV();
                break;
            default:
                return;
        }
    }

    static exportAsCSV() {
        const content = LabelsSelector.getImagesData()
            .map((imageData) => {
                return PointLabelsExporter.wrapRectLabelsIntoCSV(imageData);})
            .filter((imageLabelData) => {
                return !!imageLabelData})
            .join("\n");
        const fileName = `${ExporterUtil.getExportFileName()}.csv`;
        ExporterUtil.saveAs(content, fileName);
    }

    static wrapRectLabelsIntoCSV(imageData) {
        if (imageData.labelPoints.length === 0 || !imageData.loadStatus)
            return null;

        const image = ImageRepository.getById(imageData.id);
        const labelNames = LabelsSelector.getLabelNames();
        const labelRectsString = imageData.labelPoints.map((labelPoint) => {
            const labelName = findLast(labelNames, {id: labelPoint.labelId});
            const labelFields = !!labelName ? [
                labelName.name,
                Math.round(labelPoint.point.x).toString(),
                Math.round(labelPoint.point.y).toString(),
                imageData.fileData.name,
                image.width.toString(),
                image.height.toString()
            ] : [];
            return labelFields.join(",");
        });
        return labelRectsString.join("\n");
    }
}