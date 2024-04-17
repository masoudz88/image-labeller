import {AnnotationFormatType} from "../../data/enums/AnnotationFormatType";
import {LabelsSelector} from "../../store/selectors/LabelsSelector";
import {ExporterUtil} from "../../utils/ExporterUtil";
import {findLast} from "lodash";

export class TagLabelsExporter {
    static export(exportFormatType) {
        switch (exportFormatType) {
            case AnnotationFormatType.CSV:
                TagLabelsExporter.exportAsCSV();
                break;
            case AnnotationFormatType.JSON:
                TagLabelsExporter.exportAsJSON();
                break;
            default:
                return;
        }
    }

    static exportAsCSV() {
        const content = LabelsSelector.getImagesData()
            .filter((imageData) => {
                return imageData.labelNameIds.length > 0
            })
            .map((imageData) => {
                return TagLabelsExporter.wrapLabelNamesIntoCSV(imageData);})
            .join("\n");
        const fileName = `${ExporterUtil.getExportFileName()}.csv`;
        ExporterUtil.saveAs(content, fileName);
    }

    static exportAsJSON() {
        const contentObjects = LabelsSelector.getImagesData()
            .filter((imageData) => {
                return imageData.labelNameIds.length > 0
            })
            .map((imageData) => {
                return {
                    "image": imageData.fileData.name,
                    "annotations": TagLabelsExporter.wrapLabelNamesIntoJSON(imageData)
                };})
        const content = JSON.stringify(contentObjects);
        const fileName = `${ExporterUtil.getExportFileName()}.json`;
        ExporterUtil.saveAs(content, fileName);
    }

    static wrapLabelNamesIntoCSV(imageData) {
        if (imageData.labelNameIds.length === 0 || !imageData.loadStatus)
            return null;

        const labelNames = LabelsSelector.getLabelNames();
        const annotations = imageData.labelNameIds.map((labelNameId) => {
            return findLast(labelNames, {id: labelNameId}).name;
        })
        const labelFields = annotations.length !== 0 ? [
            imageData.fileData.name,
            `"[${annotations.toString()}]"`
        ] : [];
        return labelFields.join(",");
    }

    static wrapLabelNamesIntoJSON(imageData) {
        if (imageData.labelNameIds.length === 0 || !imageData.loadStatus)
            return [];
        const labelNames = LabelsSelector.getLabelNames();
        return imageData.labelNameIds.map((labelNameId) => {
            return findLast(labelNames, {id: labelNameId}).name;
        });
    }
}