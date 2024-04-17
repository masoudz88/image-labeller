import {LabelsSelector} from '../../store/selectors/LabelsSelector';
import { v4 as uuidv4 } from 'uuid';
import {store} from '../../index';
import {updateImageDataById} from '../../store/labels/actionCreators';
import {SSDObjectDetector} from '../../ai/SSDObjectDetector';
import {ImageRepository} from '../imageRepository/ImageRepository';
import {LabelStatus} from '../../data/enums/LabelStatus';
import {findLast} from 'lodash';
import {updateSuggestedLabelList} from '../../store/ai/actionCreators';
import {PopupWindowType} from '../../data/enums/PopupWindowType';
import {updateActivePopupType} from '../../store/general/actionCreators';
import {AISelector} from '../../store/selectors/AISelector';
import {AIActions} from './AIActions';

export class AISSDObjectDetectionActions {
    static detectRectsForActiveImage() {
        const activeImageData = LabelsSelector.getActiveImageData();
        AISSDObjectDetectionActions.detectRects(activeImageData.id, ImageRepository.getById(activeImageData.id))
    }

    static detectRects(imageId, image) {
        if (LabelsSelector.getImageDataById(imageId).isVisitedBySSDObjectDetector
            || !AISelector.isAISSDObjectDetectorModelLoaded())
            return;

        store.dispatch(updateActivePopupType(PopupWindowType.LOADER));
        SSDObjectDetector.predict(image, (predictions) => {
            const suggestedLabelNames = AISSDObjectDetectionActions
                .extractNewSuggestedLabelNames(LabelsSelector.getLabelNames(), predictions);
            const rejectedLabelNames = AISelector.getRejectedSuggestedLabelList();
            const newlySuggestedNames = AIActions.excludeRejectedLabelNames(suggestedLabelNames, rejectedLabelNames);
            if (newlySuggestedNames.length > 0) {
                store.dispatch(updateSuggestedLabelList(newlySuggestedNames));
                store.dispatch(updateActivePopupType(PopupWindowType.SUGGEST_LABEL_NAMES));
            } else {
                store.dispatch(updateActivePopupType(null));
            }
            AISSDObjectDetectionActions.saveRectPredictions(imageId, predictions);
        })
    }

    static saveRectPredictions(imageId, predictions) {
        const imageData = LabelsSelector.getImageDataById(imageId);
        const predictedLabels = AISSDObjectDetectionActions.mapPredictionsToRectLabels(predictions);
        const nextImageData = {
            ...imageData,
            labelRects: imageData.labelRects.concat(predictedLabels),
            isVisitedBySSDObjectDetector: true
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
                    x: prediction.bbox[0],
                    y: prediction.bbox[1],
                    width: prediction.bbox[2],
                    height: prediction.bbox[3],
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
