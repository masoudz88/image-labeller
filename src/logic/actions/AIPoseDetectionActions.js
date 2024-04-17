import {PoseDetector} from '../../ai/PoseDetector';
import {LabelsSelector} from '../../store/selectors/LabelsSelector';
import {ImageRepository} from '../imageRepository/ImageRepository';
import {LabelStatus} from '../../data/enums/LabelStatus';
import { v4 as uuidv4 } from 'uuid';
import {store} from '../../index';
import {updateImageDataById} from '../../store/labels/actionCreators';
import {findLast} from 'lodash';
import {AISelector} from '../../store/selectors/AISelector';
import {AIActions} from './AIActions';
import {updateSuggestedLabelList} from '../../store/ai/actionCreators';
import {updateActivePopupType} from '../../store/general/actionCreators';
import {PopupWindowType} from '../../data/enums/PopupWindowType';
import {NumberUtil} from '../../utils/NumberUtil';

export class AIPoseDetectionActions {
    static detectPoseForActiveImage() {
        const activeImageData = LabelsSelector.getActiveImageData();
        AIPoseDetectionActions.detectPoses(activeImageData.id, ImageRepository.getById(activeImageData.id))
    }

    static detectPoses(imageId, image) {
        if (LabelsSelector.getImageDataById(imageId).isVisitedByPoseDetector
            || !AISelector.isAIPoseDetectorModelLoaded())
            return;

        store.dispatch(updateActivePopupType(PopupWindowType.LOADER));
        PoseDetector.predict(image, (poses) => {
            const suggestedLabelNames = AIPoseDetectionActions
                .extractNewSuggestedLabelNames(LabelsSelector.getLabelNames(), poses);
            const rejectedLabelNames = AISelector.getRejectedSuggestedLabelList();
            const newlySuggestedNames = AIActions.excludeRejectedLabelNames(suggestedLabelNames, rejectedLabelNames);
            if (newlySuggestedNames.length > 0) {
                store.dispatch(updateSuggestedLabelList(newlySuggestedNames));
                store.dispatch(updateActivePopupType(PopupWindowType.SUGGEST_LABEL_NAMES));
            } else {
                store.dispatch(updateActivePopupType(null));
            }
            AIPoseDetectionActions.savePosePredictions(imageId, poses, image);
        })
    }

    static savePosePredictions(imageId, predictions, image) {
        const imageData = LabelsSelector.getImageDataById(imageId);
        const predictedLabels = AIPoseDetectionActions
            .mapPredictionsToPointLabels(predictions)
            .filter(
            (labelPoint) => NumberUtil.isValueInRange(labelPoint.point.x, 0, image.width)
        )
            .filter(
            (labelPoint) => NumberUtil.isValueInRange(labelPoint.point.y, 0, image.height)
        )
        const nextImageData = {
            ...imageData,
            labelPoints: imageData.labelPoints.concat(predictedLabels),
            isVisitedByPoseDetector: true
        };
        store.dispatch(updateImageDataById(imageData.id, nextImageData));
    }

    static mapPredictionsToPointLabels(predictions) {
        return predictions
            .map((prediction) => {
                return prediction.keypoints
                    .map((keypoint) => {
                        return {
                            id: uuidv4(),
                            labelIndex: null,
                            labelId: null,
                            point: {
                                x: keypoint.position.x,
                                y: keypoint.position.y
                            },
                            isVisible: true,
                            isCreatedByAI: true,
                            status: LabelStatus.UNDECIDED,
                            suggestedLabel: keypoint.part
                        };
                    });
            })
            .reduce((acc, item) => {
                return acc.concat(item);
            }, []);
    }

    static extractNewSuggestedLabelNames(labels, predictions) {
        return predictions
            .map((pose) => pose.keypoints)
            .reduce((acc, item) => {
                return acc.concat(item);
            }, [])
            .map((keypoint) => keypoint.part)
            .reduce((acc, name) => {
                if (!acc.includes(name) && !findLast(labels, {name})) {
                    acc.push(name)
                }
                return acc;
            }, []);
    }

    static acceptAllSuggestedPointLabels(imageData) {
        const newImageData = {
            ...imageData,
            labelPoints: imageData.labelPoints.map((labelPoint) => {
                const labelName = findLast(LabelsSelector.getLabelNames(), {name: labelPoint.suggestedLabel});
                return {
                    ...labelPoint,
                    status: LabelStatus.ACCEPTED,
                    labelId: !!labelName ? labelName.id : labelPoint.labelId
                }
            })
        };
        store.dispatch(updateImageDataById(newImageData.id, newImageData));
    }

    static rejectAllSuggestedPointLabels(imageData) {
        const newImageData = {
            ...imageData,
            labelPoints: imageData.labelPoints.filter((labelPoint) => labelPoint.status === LabelStatus.ACCEPTED)
        };
        store.dispatch(updateImageDataById(newImageData.id, newImageData));
    }
}
