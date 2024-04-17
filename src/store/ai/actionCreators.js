import { Action } from '../Actions';

export function updateSuggestedLabelList(labelList) {
    return {
        type: Action.UPDATE_SUGGESTED_LABEL_LIST,
        payload: {
            labelList,
        }
    }
}

export function updateRejectedSuggestedLabelList(labelList) {
    return {
        type: Action.UPDATE_REJECTED_SUGGESTED_LABEL_LIST,
        payload: {
            labelList,
        }
    }
}

export function updateSSDObjectDetectorStatus(isSSDObjectDetectorLoaded) {
    return {
        type: Action.UPDATE_SSD_OBJECT_DETECTOR_STATUS,
        payload: {
            isSSDObjectDetectorLoaded,
        }
    }
}

export function updateYOLOV5ObjectDetectorStatus(isYOLOV5ObjectDetectorLoaded) {
    return {
        type: Action.UPDATE_YOLO_V5_OBJECT_DETECTOR_STATUS,
        payload: {
            isYOLOV5ObjectDetectorLoaded,
        }
    }
}

export function updatePoseDetectorStatus(isPoseDetectorLoaded) {
    return {
        type: Action.UPDATE_POSE_DETECTOR_STATUS,
        payload: {
            isPoseDetectorLoaded,
        }
    }
}

export function updateDisabledAIFlag(isAIDisabled) {
    return {
        type: Action.UPDATE_DISABLED_AI_FLAG,
        payload: {
            isAIDisabled,
        }
    }
}

export function updateRoboflowAPIDetails(roboflowAPIDetails) {
    return {
        type: Action.UPDATE_ROBOFLOW_API_DETAILS,
        payload: {
            roboflowAPIDetails
        }
    }
}
