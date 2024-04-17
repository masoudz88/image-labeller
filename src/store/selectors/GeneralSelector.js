import {store} from '../..';

export class GeneralSelector {
    static getActivePopupType() {
        return store.getState().general.activePopupType;
    }

    static getActiveContext() {
        return store.getState().general.activeContext;
    }

    static getPreventCustomCursorStatus() {
        return store.getState().general.preventCustomCursor;
    }

    static getImageDragModeStatus() {
        return store.getState().general.imageDragMode;
    }

    static getCrossHairVisibleStatus() {
        return store.getState().general.crossHairVisible;
    }

    static getCustomCursorStyle() {
        return store.getState().general.customCursorStyle;
    }

    static getProjectName() {
        return store.getState().general.projectData.name;
    }

    static getProjectType() {
        return store.getState().general.projectData.type;
    }

    static getZoom() {
        return store.getState().general.zoom;
    }

    static getEnablePerClassColorationStatus() {
        return store.getState().general.enablePerClassColoration;
    }
}
