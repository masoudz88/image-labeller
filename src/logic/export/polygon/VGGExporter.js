import {findLast} from "lodash";
import {LabelsSelector} from "../../../store/selectors/LabelsSelector";
import {ExporterUtil} from "../../../utils/ExporterUtil";

export class VGGExporter {
    static export() {
        const imagesData = LabelsSelector.getImagesData();
        const labelNames = LabelsSelector.getLabelNames();
        const content = JSON.stringify(VGGExporter.mapImagesDataToVGGObject(imagesData, labelNames));
        const fileName = `${ExporterUtil.getExportFileName()}.json`;
        ExporterUtil.saveAs(content, fileName);
    }

    static mapImagesDataToVGGObject(imagesData, labelNames) {
        return imagesData.reduce((data, image) => {
            const fileData = VGGExporter.mapImageDataToVGGFileData(image, labelNames);
            if (!!fileData) {
                data[image.fileData.name] = fileData
            }
            return data;
        }, {});
    }

    static mapImageDataToVGGFileData(imageData, labelNames) {
        const regionsData = VGGExporter.mapImageDataToVGG(imageData, labelNames);
        if (!regionsData) return null;
        return {
            fileref: "",
            size: imageData.fileData.size,
            filename: imageData.fileData.name,
            base64_img_data: "",
            file_attributes: {},
            regions: regionsData
        }
    }

    static mapImageDataToVGG(imageData, labelNames) {
        if (!imageData.loadStatus || !imageData.labelPolygons || !imageData.labelPolygons.length ||
            !labelNames || !labelNames.length) return null;

        const validLabels = VGGExporter.getValidPolygonLabels(imageData);

        if (!validLabels.length) return null;

        return validLabels.reduce((data, label, index) => {
            const labelName = findLast(labelNames, {id: label.labelId});
            if (!!labelName) {
                data[index.toString()] = {
                    shape_attributes: VGGExporter.mapPolygonToVGG(label.vertices),
                    region_attributes: {
                        label: labelName.name
                    }
                };
            }
            return data;
        }, {});
    }

    static getValidPolygonLabels(imageData) {
        return imageData.labelPolygons.filter((label) =>
            label.labelId !== null && !!label.vertices.length);
    }

    static mapPolygonToVGG(path) {
        if (!path || !path.length) return null;

        const all_points_x = path.map((point) => point.x).concat(path[0].x);
        const all_points_y = path.map((point) => point.y).concat(path[0].y);
        return {
            name: "polygon",
            all_points_x,
            all_points_y
        }
    }
}