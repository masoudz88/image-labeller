import {LabelUtil} from '../../../utils/LabelUtil';
import {AnnotationsParsingError, LabelNamesNotUniqueError} from './YOLOErrors';
import {uniq} from 'lodash';


export class YOLOUtils {
    static parseLabelsNamesFromString(content) {
        const parsedContent = JSON.parse(content);
        
        const firstKey = Object.keys(parsedContent)[0];
        const items = parsedContent[firstKey];

        const labelNames = items.map((item) => item.class.toLowerCase());

        if (uniq(labelNames).length !== labelNames.length) {
            throw new LabelNamesNotUniqueError()
        }

        return labelNames
            .map((name) => LabelUtil.createLabelName(name));
    }

    static loadLabelsList(fileData, onSuccess, onFailure) {
        const reader = new FileReader();
        reader.onloadend = (evt) => {
            try {
                const content = evt.target.result;
                const labelNames = YOLOUtils.parseLabelsNamesFromString(content);
                onSuccess(labelNames);
            } catch (error) {
                onFailure(error)
            }
        };
        reader.readAsText(fileData);
    }

    static parseYOLOAnnotationsFromString(rawAnnotations, labelNames, imageSize, imageName) {
        return rawAnnotations
            .split(/[\r\n]/)
            .filter(Boolean)
            .map(
            (rawAnnotation) => YOLOUtils.parseYOLOAnnotationFromString(rawAnnotation, labelNames, imageSize, imageName)
        );
    }

    static parseYOLOAnnotationFromString(rawAnnotation, labelNames, imageSize, imageName) {
        const components = rawAnnotation.split(' ');
        if (!YOLOUtils.validateYOLOAnnotationComponents(components, labelNames.length)) {
            throw new AnnotationsParsingError(imageName);
        }
        const labelIndex = parseInt(components[0]);
        const labelId = labelNames[labelIndex].id;
        const rectX = parseFloat(components[1]);
        const rectY = parseFloat(components[2]);
        const rectWidth = parseFloat(components[3]);
        const rectHeight = parseFloat(components[4]);
        const rect = {
            x: (rectX - rectWidth /2) * imageSize.width,
            y: (rectY - rectHeight /2) * imageSize.height,
            width: rectWidth * imageSize.width,
            height: rectHeight * imageSize.height
        }
        return LabelUtil.createLabelRect(labelId, rect);
    }

    static validateYOLOAnnotationComponents(components, labelNamesCount) {
        const validateCoordinateValue = rawValue => {
            const floatValue = Number(rawValue);
            return !isNaN(floatValue) && 0.0 <= floatValue && floatValue <= 1.0;
        }
        const validateLabelIdx = rawValue => {
            const intValue = parseInt(rawValue);
            return !isNaN(intValue) && 0 <= intValue && intValue < labelNamesCount;
        }

        return [
            components.length === 5,
            validateLabelIdx(components[0]),
            validateCoordinateValue(components[1]),
            validateCoordinateValue(components[2]),
            validateCoordinateValue(components[3]),
            validateCoordinateValue(components[4])
        ].every(Boolean);
    }
}
