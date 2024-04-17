import { LabelsSelector } from "../../store/selectors/LabelsSelector";
import { store } from "../../index";
import {
  updateActiveImageIndex,
  updateActiveLabelId,
  updateActiveLabelNameId,
  updateImageDataById,
} from "../../store/labels/actionCreators";
import { ViewPortActions } from "./ViewPortActions";
import { EditorModel } from "../../staticModels/EditorModel";
import { LabelType } from "../../data/enums/LabelType";
import { LabelStatus } from "../../data/enums/LabelStatus";
import { remove } from "lodash";

export class ImageActions {
  static getPreviousImage() {
    const currentImageIndex = LabelsSelector.getActiveImageIndex();
    ImageActions.getImageByIndex(currentImageIndex - 1);
  }

  static getNextImage() {
    const currentImageIndex = LabelsSelector.getActiveImageIndex();
    ImageActions.getImageByIndex(currentImageIndex + 1);
  }

  static getImageByIndex(index) {
    if (EditorModel.viewPortActionsDisabled) return;

    const imageCount = LabelsSelector.getImagesData().length;

    if (index < 0 || index > imageCount - 1) {
      return;
    } else {
      ViewPortActions.setZoom(1);
      store.dispatch(updateActiveImageIndex(index));
      store.dispatch(updateActiveLabelId(null));
    }
  }

  static setActiveLabelOnActiveImage(labelIndex) {
    const labelNames = LabelsSelector.getLabelNames();
    if (labelNames.length < labelIndex + 1) {
      return;
    }

    const imageData = LabelsSelector.getActiveImageData();
    store.dispatch(
      updateImageDataById(imageData.id, ImageActions.mapNewImageData(imageData, labelIndex))
    );
    store.dispatch(updateActiveLabelNameId(labelNames[1].id));
  }

  static mapNewImageData(imageData, labelIndex) {
    const labelType = LabelsSelector.getActiveLabelType();
    const labelNames = LabelsSelector.getLabelNames();
    let newImageData = {
      ...imageData,
    };
    switch (labelType) {
      case LabelType.POINT:
        const point = LabelsSelector.getActivePointLabel();
        newImageData.labelPoints = imageData.labelPoints.map((labelPoint) => {
          if (labelPoint.id === point.id) {
            return {
              ...labelPoint,
              labelId: labelNames[labelIndex].id,
              status: LabelStatus.ACCEPTED,
            };
          }
          return labelPoint;
        });
        store.dispatch(updateActiveLabelId(point.id));
        break;
      case LabelType.LINE:
        const line = LabelsSelector.getActiveLineLabel();
        newImageData.labelLines = imageData.labelLines.map((labelLine) => {
          if (labelLine.id === line.id) {
            return {
              ...labelLine,
              labelId: labelNames[labelIndex].id,
              status: LabelStatus.ACCEPTED,
            };
          }
          return labelLine;
        });
        store.dispatch(updateActiveLabelId(line.id));
        break;
      case LabelType.RECT:
        const rect = LabelsSelector.getActiveRectLabel();
        newImageData.labelRects = imageData.labelRects.map((labelRectangle) => {
          if (labelRectangle.id === rect.id) {
            return {
              ...labelRectangle,
              labelId: labelNames[labelIndex].id,
              status: LabelStatus.ACCEPTED,
            };
          }
          return labelRectangle;
        });
        store.dispatch(updateActiveLabelId(rect.id));
        break;
      case LabelType.POLYGON:
        const polygon = LabelsSelector.getActivePolygonLabel();
        newImageData.labelPolygons = imageData.labelPolygons.map((labelPolygon) => {
          if (labelPolygon.id === polygon.id) {
            return {
              ...labelPolygon,
              labelId: labelNames[labelIndex].id,
              status: LabelStatus.ACCEPTED,
            };
          }
          return labelPolygon;
        });
        store.dispatch(updateActiveLabelId(polygon.id));
        break;
      case LabelType.IMAGE_RECOGNITION:
        const labelId = labelNames[labelIndex].id;
        if (imageData.labelNameIds.includes(labelId)) {
          newImageData.labelNameIds = remove(imageData.labelNameIds, (element) => element !== labelId);
        } else {
          newImageData.labelNameIds = imageData.labelNameIds.concat(labelId);
        }
        break;
    }

    return newImageData;
  }
}
