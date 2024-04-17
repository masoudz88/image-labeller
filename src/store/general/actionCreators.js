import {Action} from '../Actions';

export function updateWindowSize(windowSize) {
    return {
        type: Action.UPDATE_WINDOW_SIZE,
        payload: {
            windowSize,
        },
    };
}

export function updateActivePopupType(activePopupType) {
    return {
        type: Action.UPDATE_ACTIVE_POPUP_TYPE,
        payload: {
            activePopupType,
        }
    }
}

export function updateCustomCursorStyle(customCursorStyle) {
    return {
        type: Action.UPDATE_CUSTOM_CURSOR_STYLE,
        payload: {
            customCursorStyle,
        }
    }
}

export function updateActiveContext(activeContext) {
    return {
        type: Action.UPDATE_CONTEXT,
        payload: {
            activeContext,
        },
    };
}

export function updatePreventCustomCursorStatus(preventCustomCursor) {
    return {
        type: Action.UPDATE_PREVENT_CUSTOM_CURSOR_STATUS,
        payload: {
            preventCustomCursor,
        },
    };
}

export function updateImageDragModeStatus(imageDragMode) {
    return {
        type: Action.UPDATE_IMAGE_DRAG_MODE_STATUS,
        payload: {
            imageDragMode,
        },
    };
}

export function updateCrossHairVisibleStatus(crossHairVisible) {
    return {
        type: Action.UPDATE_CROSS_HAIR_VISIBLE_STATUS,
        payload: {
            crossHairVisible,
        },
    };
}

export function updateProjectData(projectData) {
    return {
        type: Action.UPDATE_PROJECT_DATA,
        payload: {
            projectData,
        },
    };
}

export function updateZoom(zoom) {
    return {
        type: Action.UPDATE_ZOOM,
        payload: {
            zoom,
        },
    };
}

export function updatePerClassColorationStatus(enablePerClassColoration) {
    return {
        type: Action.UPDATE_ENABLE_PER_CLASS_COLORATION_STATUS,
        payload: {
            enablePerClassColoration,
        },
    };
}
