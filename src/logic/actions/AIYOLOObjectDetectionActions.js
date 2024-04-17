import {LabelsSelector} from '../../store/selectors/LabelsSelector';
import {ImageRepository} from '../imageRepository/ImageRepository';
import {AISelector} from '../../store/selectors/AISelector';
import {findLast} from 'lodash';
import {v4 as uuidv4} from 'uuid';
import {LabelStatus} from '../../data/enums/LabelStatus';
import {store} from '../../index';
import {updateImageDataById} from '../../store/labels/actionCreators';
import {updateActivePopupType} from '../../store/general/actionCreators';
import {PopupWindowType} from '../../data/enums/PopupWindowType';
import {AIActions} from './AIActions';
import {updateSuggestedLabelList} from '../../store/ai/actionCreators';
import {YOLOV5ObjectDetector} from '../../ai/YOLOV5ObjectDetector';

export class AIYOLOObjectDetectionActions {
    static detectRectsForActiveImage() {
        const activeImageData = LabelsSelector.getActiveImageData();
        AIYOLOObjectDetectionActions.detectRects(activeImageData.id, ImageRepository.getById(activeImageData.id))
    }

    static detectRects(imageId, image) {
        if (LabelsSelector.getImageDataById(imageId).isVisitedByYOLOObjectDetector
            || !AISelector.isAIYOLOObjectDetectorModelLoaded())
            return;

        store.dispatch(updateActivePopupType(PopupWindowType.LOADER));
        YOLOV5ObjectDetector.predict(image, (predictions) => {
            const suggestedLabelNames = AIYOLOObjectDetectionActions
                .extractNewSuggestedLabelNames(LabelsSelector.getLabelNames(), predictions);
            const rejectedLabelNames = AISelector.getRejectedSuggestedLabelList();
            const newlySuggestedNames = AIActions.excludeRejectedLabelNames(suggestedLabelNames, rejectedLabelNames);
            if (newlySuggestedNames.length > 0) {
                store.dispatch(updateSuggestedLabelList(newlySuggestedNames));
                store.dispatch(updateActivePopupType(PopupWindowType.SUGGEST_LABEL_NAMES));
            } else {
                store.dispatch(updateActivePopupType(null));
            }
            AIYOLOObjectDetectionActions.saveRectPredictions(imageId, predictions);
        })
    }

    static saveRectPredictions(imageId, predictions) {
        const imageData = LabelsSelector.getImageDataById(imageId);
        const predictedLabels = AIYOLOObjectDetectionActions.mapPredictionsToRectLabels(predictions);
        const nextImageData = {
            ...imageData,
            labelRects: imageData.labelRects.concat(predictedLabels),
            isVisitedByYOLOObjectDetector: true
        };
        store.dispatch(updateImageDataById(imageData.id, nextImageData));
    }

    static mapPredictionsToRectLabels(predictions) {
        return predictions.map((prediction) => {
            return {
                id: uuidv4(),
                labelIndex: null,
                labelId: null,
                rect: {
                    x: prediction.x,
                    y: prediction.y,
                    width: prediction.width,
                    height: prediction.height,
                },
                isVisible: true,
                isCreatedByAI: true,
                status: LabelStatus.UNDECIDED,
                suggestedLabel: prediction.class
            };
        });
    }

    static extractNewSuggestedLabelNames(labels, predictions) {
        return predictions.reduce((acc, prediction) => {
            if (!acc.includes(prediction.class) && !findLast(labels, {name: prediction.class})) {
                acc.push(prediction.class)
            }
            return acc;
        }, []);
    }

    static acceptAllSuggestedRectLabels(imageData) {
        const newImageData = {
            ...imageData,
            labelRects: imageData.labelRects.map((labelRect) => {
                const labelName = findLast(LabelsSelector.getLabelNames(), {name: labelRect.suggestedLabel});
                return {
                    ...labelRect,
                    status: LabelStatus.ACCEPTED,
                    labelId: !!labelName ? labelName.id : labelRect.labelId
                }
            })
        };
        store.dispatch(updateImageDataById(newImageData.id, newImageData));
    }

    static rejectAllSuggestedRectLabels(imageData) {
        const newImageData = {
            ...imageData,
            labelRects: imageData.labelRects.filter((labelRect) => labelRect.status === LabelStatus.ACCEPTED)
        };
        store.dispatch(updateImageDataById(newImageData.id, newImageData));
    }
}
