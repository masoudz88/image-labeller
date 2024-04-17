import {LabelType} from '../../data/enums/LabelType';
import {LabelsSelector} from '../../store/selectors/LabelsSelector';
import {AISSDObjectDetectionActions} from './AISSDObjectDetectionActions';
import {AIPoseDetectionActions} from './AIPoseDetectionActions';
import {AISelector} from '../../store/selectors/AISelector';
import {AIYOLOObjectDetectionActions} from './AIYOLOObjectDetectionActions';
import { AIRoboflowAPIObjectDetectionActions } from './AIRoboflowAPIObjectDetectionActions';

export class AIActions {
    static excludeRejectedLabelNames(suggestedLabels, rejectedLabels) {
        return suggestedLabels.reduce((acc, label) => {
            if (!rejectedLabels.includes(label)) {
                acc.push(label)
            }
            return acc;
        }, []);
    }

    static detect(imageId, image) {
        const imageData =  LabelsSelector.getImageDataById(imageId)
        const activeLabelType = LabelsSelector.getActiveLabelType();
        const isAIYOLOObjectDetectorModelLoaded = AISelector.isAIYOLOObjectDetectorModelLoaded();
        const isAISSDObjectDetectorModelLoaded = AISelector.isAISSDObjectDetectorModelLoaded();
        const isRoboflowAPIModelLoaded = AISelector.isRoboflowAPIModelLoaded();
        switch (activeLabelType) {
            case LabelType.RECT:
                if (isAISSDObjectDetectorModelLoaded) {
                    AISSDObjectDetectionActions.detectRects(imageId, image);
                }
                if (isAIYOLOObjectDetectorModelLoaded) {
                    AIYOLOObjectDetectionActions.detectRects(imageId, image);
                }
                if (isRoboflowAPIModelLoaded) {
                    AIRoboflowAPIObjectDetectionActions.detectRects(imageData)
                }
                break;
            case LabelType.POINT:
                AIPoseDetectionActions.detectPoses(imageId, image);
                break;
        }
    }

    static rejectAllSuggestedLabels(imageData) {
        const activeLabelType = LabelsSelector.getActiveLabelType();
        const isAIYOLOObjectDetectorModelLoaded = AISelector.isAIYOLOObjectDetectorModelLoaded();
        const isAISSDObjectDetectorModelLoaded = AISelector.isAISSDObjectDetectorModelLoaded();
        const isRoboflowAPIModelLoaded = AISelector.isRoboflowAPIModelLoaded();
        switch (activeLabelType) {
            case LabelType.RECT:
                if (isAISSDObjectDetectorModelLoaded) {
                    AISSDObjectDetectionActions.rejectAllSuggestedRectLabels(imageData);
                }
                if (isAIYOLOObjectDetectorModelLoaded) {
                    AIYOLOObjectDetectionActions.rejectAllSuggestedRectLabels(imageData);
                }
                if (isRoboflowAPIModelLoaded) {
                    AIRoboflowAPIObjectDetectionActions.rejectAllSuggestedRectLabels(imageData)
                }
                break;
            case LabelType.POINT:
                AIPoseDetectionActions.rejectAllSuggestedPointLabels(imageData);
                break;
        }
    }

    static acceptAllSuggestedLabels(imageData) {
        const activeLabelType = LabelsSelector.getActiveLabelType();
        const isAIYOLOObjectDetectorModelLoaded = AISelector.isAIYOLOObjectDetectorModelLoaded();
        const isAISSDObjectDetectorModelLoaded = AISelector.isAISSDObjectDetectorModelLoaded();
        const isRoboflowAPIModelLoaded = AISelector.isRoboflowAPIModelLoaded();
        switch (activeLabelType) {
            case LabelType.RECT:
                if (isAISSDObjectDetectorModelLoaded) {
                    AISSDObjectDetectionActions.acceptAllSuggestedRectLabels(imageData);
                }
                if (isAIYOLOObjectDetectorModelLoaded) {
                    AIYOLOObjectDetectionActions.acceptAllSuggestedRectLabels(imageData);
                }
                if (isRoboflowAPIModelLoaded) {
                    AIRoboflowAPIObjectDetectionActions.acceptAllSuggestedRectLabels(imageData)
                }
                break;
            case LabelType.POINT:
                AIPoseDetectionActions.acceptAllSuggestedPointLabels(imageData);
                break;
        }
    }
}
