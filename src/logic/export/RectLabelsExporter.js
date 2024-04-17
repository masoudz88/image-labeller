import {AnnotationFormatType} from '../../data/enums/AnnotationFormatType';
import {ImageRepository} from '../imageRepository/ImageRepository';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import {LabelsSelector} from '../../store/selectors/LabelsSelector';
import {XMLSanitizerUtil} from '../../utils/XMLSanitizerUtil';
import {ExporterUtil} from '../../utils/ExporterUtil';
import {GeneralSelector} from '../../store/selectors/GeneralSelector';
import {findIndex, findLast} from 'lodash';
import {NumberUtil} from '../../utils/NumberUtil';
import {RectUtil} from '../../utils/RectUtil';
import {Settings} from '../../settings/Settings';

export class RectLabelsExporter {
    static export(exportFormatType) {
        switch (exportFormatType) {
            case AnnotationFormatType.YOLO:
                RectLabelsExporter.exportAsYOLO();
                break;
            case AnnotationFormatType.VOC:
                RectLabelsExporter.exportAsVOC();
                break;
            case AnnotationFormatType.CSV:
                RectLabelsExporter.exportAsCSV();
                break;
            default:
                return;
        }
    }

    static exportAsYOLO() {
        const zip = new JSZip();
        LabelsSelector.getImagesData()
            .forEach((imageData) => {
                const fileContent = RectLabelsExporter.wrapRectLabelsIntoYOLO(imageData);
                if (fileContent) {
                    const fileName = imageData.fileData.name.replace(/\.[^/.]+$/, '.txt');
                    try {
                        zip.file(fileName, fileContent);
                    } catch (error) {
                        // TODO
                        throw new Error(error);
                    }
                }
            });

        try {
            zip.generateAsync({type:'blob'})
                .then((content) => {
                    saveAs(content, `${ExporterUtil.getExportFileName()}.zip`);
                });
        } catch (error) {
            // TODO
            throw new Error(error);
        }
    }

    static wrapRectLabelIntoYOLO(labelRect, labelNames, imageSize) {
        const snapAndFix = (value) => NumberUtil.snapValueToRange(value, 0, 1).toFixed(6)
        const classIdx = findIndex(labelNames, {id: labelRect.labelId}).toString()
        const rectCenter = RectUtil.getCenter(labelRect.rect)
        const rectSize = RectUtil.getSize(labelRect.rect)
        const rawBBox = [
            rectCenter.x / imageSize.width,
            rectCenter.y / imageSize.height,
            rectSize.width / imageSize.width,
            rectSize.height / imageSize.height
        ]

        let [x, y, width, height] = rawBBox.map((value) => parseFloat(snapAndFix(value)))

        if (x + width / 2 > 1) { width = 2 * (1 - x) }
        if (x - width / 2 < 0) { width = 2 * x }
        if (y + height / 2 > 1) { height = 2 * (1 - y) }
        if (y - height / 2 < 0) { height = 2 * y }

        const processedBBox = [x, y, width, height].map((value) => snapAndFix(value))

        return [classIdx, ...processedBBox].join(' ');
    }

    static wrapRectLabelIntoCSV(labelRect, labelNames, imageSize, imageName) {
        const labelName = findLast(labelNames, {id: labelRect.labelId});
        const labelFields = [
            !!labelName ? labelName.name: '',
            Math.round(labelRect.rect.x).toString(),
            Math.round(labelRect.rect.y).toString(),
            Math.round(labelRect.rect.width).toString(),
            Math.round(labelRect.rect.height).toString(),
            imageName,
            imageSize.width.toString(),
            imageSize.height.toString()
        ];
        return labelFields.join(Settings.CSV_SEPARATOR);
    }

    static wrapRectLabelsIntoYOLO(imageData) {
        if (imageData.labelRects.length === 0 || !imageData.loadStatus)
            return null;

        const labelNames = LabelsSelector.getLabelNames();
        const image = ImageRepository.getById(imageData.id);
        const imageSize = {width: image.width, height: image.height}
        const labelRectsString = imageData.labelRects
            .filter((labelRect) => labelRect.labelId !== null)
            .map((labelRect) => {
                return RectLabelsExporter.wrapRectLabelIntoYOLO(labelRect, labelNames, imageSize);
            });
        return labelRectsString.join('\n');
    }

    static exportAsVOC() {
        const zip = new JSZip();
        LabelsSelector.getImagesData().forEach((imageData) => {
            const fileContent = RectLabelsExporter.wrapImageIntoVOC(imageData);
            if (fileContent) {
                const fileName = imageData.fileData.name.replace(/\.[^/.]+$/, '.xml');
                try {
                    zip.file(fileName, fileContent);
                } catch (error) {
                    // TODO
                    throw new Error(error);
                }
            }
        });

        try {
            zip.generateAsync({type:'blob'})
                .then(content => {
                    saveAs(content, `${ExporterUtil.getExportFileName()}.zip`);
                });
        } catch (error) {
            // TODO
            throw new Error(error);
        }
    }

    static wrapRectLabelsIntoVOC(imageData) {
        if (imageData.labelRects.length === 0 || !imageData.loadStatus)
            return null;

        const labelNamesList = LabelsSelector.getLabelNames();
        const labelRectsString = imageData.labelRects.map((labelRect) => {
            const labelName = findLast(labelNamesList, {id: labelRect.labelId});
            const labelFields = !!labelName ? [
                `\t<object>`,
                `\t\t<name>${labelName.name}</name>`,
                `\t\t<pose>Unspecified</pose>`,
                `\t\t<truncated>0</truncated>`,
                `\t\t<difficult>0</difficult>`,
                `\t\t<bndbox>`,
                `\t\t\t<xmin>${Math.round(labelRect.rect.x)}</xmin>`,
                `\t\t\t<ymin>${Math.round(labelRect.rect.y)}</ymin>`,
                `\t\t\t<xmax>${Math.round(labelRect.rect.x + labelRect.rect.width)}</xmax>`,
                `\t\t\t<ymax>${Math.round(labelRect.rect.y + labelRect.rect.height)}</ymax>`,
                `\t\t</bndbox>`,
                `\t</object>`
            ] : [];
            return labelFields.join('\n');
        });
        return labelRectsString.join('\n');
    }

    static wrapImageIntoVOC(imageData) {
        const labels = RectLabelsExporter.wrapRectLabelsIntoVOC(imageData);
        const projectName = XMLSanitizerUtil.sanitize(GeneralSelector.getProjectName());

        if (labels) {
            const image = ImageRepository.getById(imageData.id);
            return [
                `<annotation>`,
                `\t<folder>${projectName}</folder>`,
                `\t<filename>${imageData.fileData.name}</filename>`,
                `\t<path>/${projectName}/${imageData.fileData.name}</path>`,
                `\t<source>`,
                `\t\t<database>Unspecified</database>`,
                `\t</source>`,
                `\t<size>`,
                `\t\t<width>${image.width}</width>`,
                `\t\t<height>${image.height}</height>`,
                `\t\t<depth>3</depth>`,
                `\t</size>`,
                labels,
                `</annotation>`
            ].join('\n');
        }
        return null;
    }


    static exportAsCSV() {
        try {
            const contentEntries = LabelsSelector.getImagesData()
                .map((imageData) => {
                    return RectLabelsExporter.wrapRectLabelsIntoCSV(imageData);})
                .filter((imageLabelData) => {
                    return !!imageLabelData})
            contentEntries.unshift(Settings.RECT_LABELS_EXPORT_CSV_COLUMN_NAMES)

            const content = contentEntries.join('\n');
            const fileName = `${ExporterUtil.getExportFileName()}.csv`;
            ExporterUtil.saveAs(content, fileName);
        } catch (error) {
            // TODO
            throw new Error(error);
        }
    }

    static wrapRectLabelsIntoCSV(imageData) {
        if (imageData.labelRects.length === 0 || !imageData.loadStatus)
            return null;

        const image = ImageRepository.getById(imageData.id);
        const labelNames = LabelsSelector.getLabelNames();
        const imageSize = {width: image.width, height: image.height}
        const labelRectsString = imageData.labelRects
            .filter((labelRect) => labelRect.labelId !== null)
            .map(
            (labelRect) => RectLabelsExporter.wrapRectLabelIntoCSV(labelRect, labelNames, imageSize, imageData.fileData.name)
        );
        return labelRectsString.join('\n');
    }
}
