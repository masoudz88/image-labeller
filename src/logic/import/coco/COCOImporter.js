import {LabelsSelector} from '../../../store/selectors/LabelsSelector';
import { v4 as uuidv4 } from 'uuid';
import { ArrayUtil } from '../../../utils/ArrayUtil';
import {ImageDataUtil} from '../../../utils/ImageDataUtil';
import {LabelUtil} from '../../../utils/LabelUtil';
import {
    COCOAnnotationDeserializationError,
    COCOAnnotationFileCountError,
    COCOAnnotationReadingError,
    COCOFormatValidationError
} from './COCOErrors';
import {LabelType} from '../../../data/enums/LabelType';
import { AnnotationImporter } from '../AnnotationImporter';
import {COCOUtils} from './COCOUtils';
import {Settings} from "../../../settings/Settings";

export class COCOImporter extends AnnotationImporter {
    static requiredKeys = ['images', 'annotations', 'categories'];

    import(filesData, onSuccess, onFailure) {
        if (filesData.length > 1) {
            onFailure(new COCOAnnotationFileCountError());
        }

        const reader = new FileReader();
        reader.readAsText(filesData[0]);
        reader.onloadend = (evt) => {
            try {
                const inputImagesData = LabelsSelector.getImagesData();
                const annotations = COCOImporter.deserialize(evt.target.result)
                const {imagesData, labelNames} = this.applyLabels(inputImagesData, annotations);
                onSuccess(imagesData, labelNames);
            } catch (error) {
                onFailure(error);
            }
        };
        reader.onerror = () => onFailure(new COCOAnnotationReadingError());
    }

    static deserialize(text) {
        try {
            return JSON.parse(text);
        } catch (error) {
            throw new COCOAnnotationDeserializationError()
        }
    }

    applyLabels(imageData, annotationsObject) {
        COCOImporter.validateCocoFormat(annotationsObject);
        const {images, categories, annotations} = annotationsObject;
        const labelNameMap = COCOImporter.mapCOCOCategories(categories);
        const cleanImageData = imageData.map((item) => ImageDataUtil.cleanAnnotations(item));
        const imageDataPartition = COCOImporter.partitionImageData(cleanImageData, images);
        const imageDataMap = COCOImporter.mapImageData(imageDataPartition.pass, images);

        for (const annotation of annotations) {
            if (!imageDataMap[annotation.image_id] || annotation.iscrowd === 1)
                continue

            if (this.labelType.includes(LabelType.RECT)) {
                imageDataMap[annotation.image_id].labelRects.push(LabelUtil.createLabelRect(
                    labelNameMap[annotation.category_id].id,
                    COCOUtils.bbox2rect(annotation.bbox)
                ))
            }

            if (this.labelType.includes(LabelType.POLYGON)) {
                const polygons = COCOUtils.segmentation2vertices(annotation.segmentation);
                for (const polygon of polygons) {
                    imageDataMap[annotation.image_id].labelPolygons.push(
                        LabelUtil.createLabelPolygon(labelNameMap[annotation.category_id].id, polygon)
                    )
                }
            }
        }

        const resultImageData = Object.values(imageDataMap).concat(imageDataPartition.fail);

        return {
            imagesData: ImageDataUtil.arrange(resultImageData, imageData.map((item) => item.id)),
            labelNames: Object.values(labelNameMap)
        };
    }

    static partitionImageData(items, images) {
        const imageNames = images.map((item) => item.file_name);
        const predicate = (item) => imageNames.includes(item.fileData.name);
        return ArrayUtil.partition(items, predicate);
    }

    static mapCOCOCategories(categories) {
        return categories.reduce((acc, category, index) => {
            acc[category.id] = {
                id: uuidv4(),
                name: category.name,
                color: ArrayUtil.getByInfiniteIndex(Settings.LABEL_COLORS_PALETTE, index)
            }
            return acc
        }, {});
    }

    static mapImageData(items, images) {
        const fileNameCOCOIdMap = images.reduce((acc, image) => {
            acc[image.file_name] = image.id
            return acc
        }, {});
        return items.reduce((acc, image) => {
            acc[fileNameCOCOIdMap[image.fileData.name]] = image
            return acc;
        }, {});
    }

    static validateCocoFormat(annotationsObject) {
        const missingKeys = COCOImporter.requiredKeys.filter((key) => !annotationsObject.hasOwnProperty(key))
        if (missingKeys.length !== 0) {
            throw new COCOFormatValidationError(`Uploaded file does not contain all required keys: ${missingKeys}`)
        }
    }
}
