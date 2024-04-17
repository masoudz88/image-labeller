import {LabelsSelector} from '../../store/selectors/LabelsSelector';
import {filter} from 'lodash';
import {store} from '../../index';
import {updateImageData, updateImageDataById} from '../../store/labels/actionCreators';
import {LabelType} from '../../data/enums/LabelType';
import {LabelUtil} from '../../utils/LabelUtil';

export class LabelActions {
    static deleteActiveLabel() {
        const activeImageData = LabelsSelector.getActiveImageData();
        const activeLabelId = LabelsSelector.getActiveLabelId();
        LabelActions.deleteImageLabelById(activeImageData.id, activeLabelId);
    }

    static deleteImageLabelById(imageId, labelId) {
        switch (LabelsSelector.getActiveLabelType()) {
            case LabelType.POINT:
                LabelActions.deletePointLabelById(imageId, labelId);
                break;
            case LabelType.RECT:
                LabelActions.deleteRectLabelById(imageId, labelId);
                break;
            case LabelType.POLYGON:
                LabelActions.deletePolygonLabelById(imageId, labelId);
                break;
        }
    }

    static deleteRectLabelById(imageId, labelRectId) {
        const imageData = LabelsSelector.getImageDataById(imageId);
        const newImageData = {
            ...imageData,
            labelRects: filter(imageData.labelRects, (currentLabel) => {
                return currentLabel.id !== labelRectId;
            })
        };
        store.dispatch(updateImageDataById(imageData.id, newImageData));
    }

    static deletePointLabelById(imageId, labelPointId) {
        const imageData = LabelsSelector.getImageDataById(imageId);
        const newImageData = {
            ...imageData,
            labelPoints: filter(imageData.labelPoints, (currentLabel) => {
                return currentLabel.id !== labelPointId;
            })
        };
        store.dispatch(updateImageDataById(imageData.id, newImageData));
    }

    static deleteLineLabelById(imageId, labelLineId) {
        const imageData = LabelsSelector.getImageDataById(imageId);
        const newImageData = {
            ...imageData,
            labelLines: filter(imageData.labelLines, (currentLabel) => {
                return currentLabel.id !== labelLineId;
            })
        };
        store.dispatch(updateImageDataById(imageData.id, newImageData));
    }

    static deletePolygonLabelById(imageId, labelPolygonId) {
        const imageData = LabelsSelector.getImageDataById(imageId);
        const newImageData = {
            ...imageData,
            labelPolygons: filter(imageData.labelPolygons, (currentLabel) => {
                return currentLabel.id !== labelPolygonId;
            })
        };
        store.dispatch(updateImageDataById(imageData.id, newImageData));
    }

    static toggleLabelVisibilityById(imageId, labelId) {
        const imageData = LabelsSelector.getImageDataById(imageId);
        const newImageData = {
            ...imageData,
            labelPoints: imageData.labelPoints.map((labelPoint) => {
                return labelPoint.id === labelId ? LabelUtil.toggleAnnotationVisibility(labelPoint) : labelPoint;
            }),
            labelRects: imageData.labelRects.map((labelRect) => {
                return labelRect.id === labelId ? LabelUtil.toggleAnnotationVisibility(labelRect) : labelRect;
            }),
            labelPolygons: imageData.labelPolygons.map((labelPolygon) => {
                return labelPolygon.id === labelId ? LabelUtil.toggleAnnotationVisibility(labelPolygon) : labelPolygon;
            }),
            labelLines: imageData.labelLines.map((labelLine) => {
                return labelLine.id === labelId ? LabelUtil.toggleAnnotationVisibility(labelLine) : labelLine;
            }),
        };
        store.dispatch(updateImageDataById(imageData.id, newImageData));
    }

    static removeLabelNames(labelNamesIds) {
        const imagesData = LabelsSelector.getImagesData();
        const newImagesData = imagesData.map((imageData) => {
            return LabelActions.removeLabelNamesFromImageData(imageData, labelNamesIds);
        });
        store.dispatch(updateImageData(newImagesData))
    }

    static removeLabelNamesFromImageData(imageData, labelNamesIds) {
        return {
            ...imageData,
            labelRects: imageData.labelRects.map((labelRect) => {
                if (labelNamesIds.includes(labelRect.id)) {
                    return {
                        ...labelRect,
                        id: null
                    }
                } else {
                    return labelRect
                }
            }),
            labelPoints: imageData.labelPoints.map((labelPoint) => {
                if (labelNamesIds.includes(labelPoint.id)) {
                    return {
                        ...labelPoint,
                        id: null
                    }
                } else {
                    return labelPoint
                }
            }),
            labelPolygons: imageData.labelPolygons.map((labelPolygon) => {
                if (labelNamesIds.includes(labelPolygon.id)) {
                    return {
                        ...labelPolygon,
                        id: null
                    }
                } else {
                    return labelPolygon
                }
            }),
            labelNameIds: imageData.labelNameIds.filter((labelNameId) => {
                return !labelNamesIds.includes(labelNameId);
            })
        };
    }

    static labelExistsInLabelNames(label) {
        const labelNames = LabelsSelector.getLabelNames();
        return labelNames
            .map((labelName) => labelName.name)
            .includes(label);
    }
}
