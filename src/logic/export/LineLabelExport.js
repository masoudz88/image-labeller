import {AnnotationFormatType} from "../../data/enums/AnnotationFormatType";
import {LabelsSelector} from "../../store/selectors/LabelsSelector";
import {ExporterUtil} from "../../utils/ExporterUtil";
import {ImageRepository} from "../imageRepository/ImageRepository";
import {findLast} from "lodash";

export class LineLabelsExporter {
    static export(exportFormatType) {
        switch (exportFormatType) {
            case AnnotationFormatType.CSV:
                LineLabelsExporter.exportAsCSV();
                break;
            default:
                return;
        }
    }

    static exportAsCSV() {
        const content = LabelsSelector.getImagesData()
            .map((imageData) => {
                return LineLabelsExporter.wrapLineLabelsIntoCSV(imageData);})
            .filter((imageLabelData) => {
                return !!imageLabelData})
            .join("\n");
        const fileName = `${ExporterUtil.getExportFileName()}.csv`;
        ExporterUtil.saveAs(content, fileName);
    }

    static wrapLineLabelsIntoCSV(imageData) {
        if (imageData.labelLines.length === 0 || !imageData.loadStatus)
            return null;

        const image = ImageRepository.getById(imageData.id);
        const labelNames = LabelsSelector.getLabelNames();
        const labelLinesString = imageData.labelLines.map((labelLine) => {
            const labelName = findLast(labelNames, {id: labelLine.labelId});
            const labelFields = !!labelName ? [
                labelName.name,
                Math.round(labelLine.line.start.x).toString(),
                Math.round(labelLine.line.start.y).toString(),
                Math.round(labelLine.line.end.x).toString(),
                Math.round(labelLine.line.end.y).toString(),
                imageData.fileData.name,
                image.width.toString(),
                image.height.toString()
            ] : [];
            return labelFields.join(",");
        });
        return labelLinesString.join("\n");
    }
}