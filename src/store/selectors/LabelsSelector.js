import {store} from '../..';
import {find} from 'lodash';

export class LabelsSelector {
    static getLabelNames() {
        return store.getState().labels.labels;
    }

    static getLabelNameById(id) {
        const labelName = LabelsSelector.getLabelNames()
        return find(labelName, {id});
    }

    static getActiveLabelNameId() {
        return store.getState().labels.activeLabelNameId;
    }

    static getActiveLabelType() {
        return store.getState().labels.activeLabelType;
    }

    static getImagesData() {
        return store.getState().labels.imagesData;
    }

    static getActiveImageIndex() {
        return store.getState().labels.activeImageIndex;
    }

    static getActiveImageData() {
        const activeImageIndex = LabelsSelector.getActiveImageIndex();

        if (activeImageIndex === null)
            return null;

        return LabelsSelector.getImageDataByIndex(activeImageIndex);
    }

    static getImageDataByIndex(index) {
        const imagesData = LabelsSelector.getImagesData();
        return imagesData[index];
    }

    static getImageDataById(id) {
        const imagesData = LabelsSelector.getImagesData();
        return find(imagesData, {id});
    }

    static getActiveLabelId() {
        return store.getState().labels.activeLabelId;
    }

    static getHighlightedLabelId() {
        return store.getState().labels.highlightedLabelId;
    }

    static getActiveRectLabel() {
        const activeLabelId = LabelsSelector.getActiveLabelId();

        if (activeLabelId === null)
            return null;

        return find(LabelsSelector.getActiveImageData().labelRects, {id: activeLabelId});
    }

    static getActivePointLabel() {
        const activeLabelId = LabelsSelector.getActiveLabelId();

        if (activeLabelId === null)
            return null;

        return find(LabelsSelector.getActiveImageData().labelPoints, {id: activeLabelId});
    }

    static getActivePolygonLabel() {
        const activeLabelId = LabelsSelector.getActiveLabelId();

        if (activeLabelId === null)
            return null;

        return find(LabelsSelector.getActiveImageData().labelPolygons, {id: activeLabelId});
    }

    static getActiveLineLabel() {
        const activeLabelId = LabelsSelector.getActiveLabelId();

        if (activeLabelId === null)
            return null;

        return find(LabelsSelector.getActiveImageData().labelLines, {id: activeLabelId});
    }
}
