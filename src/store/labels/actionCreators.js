import {Action} from '../Actions';

export function updateActiveImageIndex(activeImageIndex) {
    return {
        type: Action.UPDATE_ACTIVE_IMAGE_INDEX,
        payload: {
            activeImageIndex,
        },
    };
}

export function updateActiveLabelNameId(activeLabelNameId) {
    return {
        type: Action.UPDATE_ACTIVE_LABEL_NAME_ID,
        payload: {
            activeLabelNameId,
        },
    };
}

export function updateActiveLabelId(activeLabelId) {
    return {
        type: Action.UPDATE_ACTIVE_LABEL_ID,
        payload: {
            activeLabelId,
        },
    };
}

export function updateHighlightedLabelId(highlightedLabelId) {
    return {
        type: Action.UPDATE_HIGHLIGHTED_LABEL_ID,
        payload: {
            highlightedLabelId,
        },
    };
}

export function updateActiveLabelType(activeLabelType) {
    return {
        type: Action.UPDATE_ACTIVE_LABEL_TYPE,
        payload: {
            activeLabelType,
        },
    };
}

export function updateImageDataById(id, newImageData) {
    return {
        type: Action.UPDATE_IMAGE_DATA_BY_ID,
        payload: {
            id,
            newImageData
        },
    };
}

export function addImageData(imageData) {
    return {
        type: Action.ADD_IMAGES_DATA,
        payload: {
            imageData,
        },
    };
}

export function updateImageData(imageData) {
    return {
        type: Action.UPDATE_IMAGES_DATA,
        payload: {
            imageData,
        },
    };
}

export function updateLabelNames(labels) {
    return {
        type: Action.UPDATE_LABEL_NAMES,
        payload: {
            labels
        }
    }
}

export function updateFirstLabelCreatedFlag(firstLabelCreatedFlag) {
    return {
        type: Action.UPDATE_FIRST_LABEL_CREATED_FLAG,
        payload: {
            firstLabelCreatedFlag
        }
    }
}
