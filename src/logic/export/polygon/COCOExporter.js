import {LabelsSelector} from "../../../store/selectors/LabelsSelector";
import {GeneralSelector} from "../../../store/selectors/GeneralSelector";
import {ImageRepository} from "../../imageRepository/ImageRepository";
import {ExporterUtil} from "../../../utils/ExporterUtil";
import {flatten} from "lodash";

export class COCOExporter {
    static export() {
        const imagesData = LabelsSelector.getImagesData();
        const labelNames = LabelsSelector.getLabelNames();
        const projectName = GeneralSelector.getProjectName();
        const COCOObject = COCOExporter.mapImagesDataToCOCOObject(imagesData, labelNames, projectName);
        const content = JSON.stringify(COCOObject);
        const fileName = `${ExporterUtil.getExportFileName()}.json`;
        ExporterUtil.saveAs(content, fileName);
    }

    static mapImagesDataToCOCOObject(imagesData, labelNames, projectName) {
        return {
            "info": COCOExporter.getInfoComponent(projectName),
            "images": COCOExporter.getImagesComponent(imagesData),
            "annotations": COCOExporter.getAnnotationsComponent(imagesData, labelNames),
            "categories":COCOExporter.getCategoriesComponent(labelNames)
        };
    }

    static getInfoComponent(description) {
        return {
            "description": description
        }
    }

    static getCategoriesComponent(labelNames) {
        return labelNames.map((labelName, index) => {
            return {
                "id": index + 1,
                "name": labelName.name
            }
        });
    }

    static getImagesComponent(imagesData) {
        return imagesData
            .filter((imagesData) => imagesData.loadStatus)
            .filter((imagesData) => imagesData.labelPolygons.length !== 0)
            .map((imageData, index) => {
                const image = ImageRepository.getById(imageData.id);
                return {
                    "id": index + 1,
                    "width": image.width,
                    "height": image.height,
                    "file_name": imageData.fileData.name
                }
            });
    }

    static getAnnotationsComponent(imagesData, labelNames) {
        const labelsMap = COCOExporter.mapLabelsData(labelNames);
        let id = 0;
        const annotations = imagesData
            .filter((imagesData) => imagesData.loadStatus)
            .filter((imagesData) => imagesData.labelPolygons.length !== 0)
            .map((imageData, index) => {
                return imageData.labelPolygons.map((labelPolygon) => {
                    return {
                        "id": id++,
                        "iscrowd": 0,
                        "image_id": index + 1,
                        "category_id": labelsMap[labelPolygon.labelId],
                        "segmentation": COCOExporter.getCOCOSegmentation(labelPolygon.vertices),
                        "bbox": COCOExporter.getCOCOBbox(labelPolygon.vertices),
                        "area": COCOExporter.getCOCOArea(labelPolygon.vertices)
                    };
                });
            })
        return flatten(annotations);
    }

    static mapLabelsData(labelNames) {
        return labelNames.reduce((data, label, index) => {
            data[label.id] = index + 1;
            return data;
        }, {});
    }

    static getCOCOSegmentation(vertices) {
        const points = vertices.map((point) => [point.x, point.y]);
        return [flatten(points)];
    }

    static getCOCOBbox(vertices) {
        let xMin = vertices[0].x;
        let xMax = vertices[0].x;
        let yMin = vertices[0].y;
        let yMax = vertices[0].y;
        for (const vertex of vertices){
            if (xMin > vertex.x) xMin = vertex.x;
            if (xMax < vertex.x) xMax = vertex.x;
            if (yMin > vertex.y) yMin = vertex.y;
            if (yMax < vertex.y) yMax = vertex.y;
        }
        return [xMin, yMin, xMax - xMin, yMax - yMin];
    }

    static getCOCOArea(vertices) {
        let area = 0;
        let j = vertices.length - 1;
        for (let  i = 0; i < vertices.length; i++) {
            area += (vertices[j].x + vertices[i].x) * (vertices[j].y - vertices[i].y);
            j = i;
        }
        return Math.abs(area/2);
    }
}