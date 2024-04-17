import {store} from '../..';

export class AISelector {
    static getSuggestedLabelList() {
        return store.getState().ai.suggestedLabelList;
    }

    static getRejectedSuggestedLabelList() {
        return store.getState().ai.rejectedSuggestedLabelList;
    }

    static isAISSDObjectDetectorModelLoaded() {
        return store.getState().ai.isSSDObjectDetectorLoaded;
    }

    static isAIYOLOObjectDetectorModelLoaded() {
        return store.getState().ai.isYOLOV5ObjectDetectorLoaded;
    }

    static isAIPoseDetectorModelLoaded() {
        return store.getState().ai.isPoseDetectorLoaded;
    }

    static isRoboflowAPIModelLoaded() {
        const roboflowAPIDetails = store.getState().ai.roboflowAPIDetails;
        return (
            roboflowAPIDetails.model !== '' && roboflowAPIDetails.key !== '' && roboflowAPIDetails.status
        );
    }

    static isAIDisabled() {
        return store.getState().ai.isAIDisabled;
    }

    static getRoboflowAPIDetails() {
        return store.getState().ai.roboflowAPIDetails;
    }
}
