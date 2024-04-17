import {RenderEngineSettings} from '../../settings/RenderEngineSettings';
import {CanvasUtil} from '../../utils/CanvasUtil';
import {store} from '../../index';
import {
    updateActiveLabelId,
    updateFirstLabelCreatedFlag,
    updateHighlightedLabelId,
    updateImageDataById
} from '../../store/labels/actionCreators';
import {RectUtil} from '../../utils/RectUtil';
import {DrawUtil} from '../../utils/DrawUtil';
import {updateCustomCursorStyle} from '../../store/general/actionCreators';
import {CustomCursorStyle} from '../../data/enums/CustomCursorStyle';
import {LabelsSelector} from '../../store/selectors/LabelsSelector';
import {BaseRenderEngine} from './BaseRenderEngine';
import {RenderEngineUtil} from '../../utils/RenderEngineUtil';
import {LabelType} from '../../data/enums/LabelType';
import {EditorActions} from '../actions/EditorActions';
import {EditorModel} from '../../staticModels/EditorModel';
import {GeneralSelector} from '../../store/selectors/GeneralSelector';
import {LabelStatus} from '../../data/enums/LabelStatus';
import {Settings} from '../../settings/Settings';
import {LabelUtil} from '../../utils/LabelUtil';

export class PointRenderEngine extends BaseRenderEngine {

    // =================================================================================================================
    // STATE
    // =================================================================================================================

    constructor(canvas) {
        super(canvas);
        this.labelType = LabelType.POINT;
    }

    // =================================================================================================================
    // EVENT HANDLERS
    // =================================================================================================================

    mouseDownHandler(data) {
        const isMouseOverImage = RenderEngineUtil.isMouseOverImage(data);
        const isMouseOverCanvas = RenderEngineUtil.isMouseOverCanvas(data);

        if (isMouseOverCanvas) {
            const labelPoint = this.getLabelPointUnderMouse(data.mousePositionOnViewPortContent, data);
            if (!!labelPoint) {
                const pointOnCanvas = RenderEngineUtil.transferPointFromImageToViewPortContent(labelPoint.point, data);
                const pointBetweenPixels = RenderEngineUtil.setPointBetweenPixels(pointOnCanvas);
                const handleRect = RectUtil.getRectWithCenterAndSize(pointBetweenPixels, RenderEngineSettings.anchorHoverSize);
                if (RectUtil.isPointInside(handleRect, data.mousePositionOnViewPortContent)) {
                    store.dispatch(updateActiveLabelId(labelPoint.id));
                    EditorActions.setViewPortActionsDisabledStatus(true);
                    return;
                } else {
                    store.dispatch(updateActiveLabelId(null));
                    const pointOnImage = RenderEngineUtil.transferPointFromViewPortContentToImage(data.mousePositionOnViewPortContent, data);
                    this.addPointLabel(pointOnImage);
                }
            } else if (isMouseOverImage) {
                const pointOnImage = RenderEngineUtil.transferPointFromViewPortContentToImage(data.mousePositionOnViewPortContent, data);
                this.addPointLabel(pointOnImage);
            }
        }
    }

    mouseUpHandler(data) {
        if (this.isInProgress()) {
            const activeLabelPoint = LabelsSelector.getActivePointLabel();
            const pointSnapped = RectUtil.snapPointToRect(data.mousePositionOnViewPortContent, data.viewPortContentImageRect);
            const pointOnImage = RenderEngineUtil.transferPointFromViewPortContentToImage(pointSnapped, data);
            const imageData = LabelsSelector.getActiveImageData();

            imageData.labelPoints = imageData.labelPoints.map((labelPoint) => {
                if (labelPoint.id === activeLabelPoint.id) {
                    return {
                        ...labelPoint,
                        point: pointOnImage
                    };
                }
                return labelPoint;
            });
            store.dispatch(updateImageDataById(imageData.id, imageData));
        }
        EditorActions.setViewPortActionsDisabledStatus(false);
    }

    mouseMoveHandler(data) {
        const isOverImage = RenderEngineUtil.isMouseOverImage(data);
        if (isOverImage) {
            const labelPoint = this.getLabelPointUnderMouse(data.mousePositionOnViewPortContent, data);
            if (!!labelPoint) {
                if (LabelsSelector.getHighlightedLabelId() !== labelPoint.id) {
                    store.dispatch(updateHighlightedLabelId(labelPoint.id))
                }
            } else {
                if (LabelsSelector.getHighlightedLabelId() !== null) {
                    store.dispatch(updateHighlightedLabelId(null))
                }
            }
        }
    }

    // =================================================================================================================
    // RENDERING
    // =================================================================================================================

    render(data) {
        const activeLabelId = LabelsSelector.getActiveLabelId();
        const highlightedLabelId = LabelsSelector.getHighlightedLabelId();
        const imageData = LabelsSelector.getActiveImageData();
        if (imageData) {
            imageData.labelPoints.forEach((labelPoint) => {
                if (labelPoint.isVisible) {
                    if (labelPoint.id === activeLabelId) {
                        if (this.isInProgress()) {
                            const pointSnapped = RectUtil.snapPointToRect(data.mousePositionOnViewPortContent, data.viewPortContentImageRect);
                            const pointBetweenPixels = RenderEngineUtil.setPointBetweenPixels(pointSnapped);
                            const anchorColor = BaseRenderEngine.resolveLabelAnchorColor(true);
                            DrawUtil.drawCircleWithFill(
                                this.canvas,
                                pointBetweenPixels,
                                Settings.RESIZE_HANDLE_DIMENSION_PX/2,
                                anchorColor
                            )
                        } else {
                            this.renderPoint(labelPoint, true, data);
                        }
                    } else {
                        this.renderPoint(
                            labelPoint,
                            labelPoint.id === activeLabelId || labelPoint.id === highlightedLabelId,
                            data
                        );
                    }
                }
            });
        }
        this.updateCursorStyle(data);
    }

    renderPoint(labelPoint, isActive, data) {
        const pointOnImage = RenderEngineUtil.transferPointFromImageToViewPortContent(labelPoint.point, data);
        const pointBetweenPixels = RenderEngineUtil.setPointBetweenPixels(pointOnImage);
        const anchorColor = BaseRenderEngine.resolveLabelAnchorColor(isActive);
        DrawUtil.drawCircleWithFill(
            this.canvas,
            pointBetweenPixels,
            Settings.RESIZE_HANDLE_DIMENSION_PX/2,
            anchorColor
        )
    }

    updateCursorStyle(data) {
        if (!!this.canvas && !!data.mousePositionOnViewPortContent && !GeneralSelector.getImageDragModeStatus()) {
            const labelPoint = this.getLabelPointUnderMouse(data.mousePositionOnViewPortContent, data);
            if (!!labelPoint && labelPoint.status === LabelStatus.ACCEPTED) {
                const pointOnCanvas = RenderEngineUtil.transferPointFromImageToViewPortContent(labelPoint.point, data);
                const pointBetweenPixels = RenderEngineUtil.setPointBetweenPixels(pointOnCanvas);
                const handleRect = RectUtil.getRectWithCenterAndSize(pointBetweenPixels, RenderEngineSettings.anchorHoverSize);
                if (RectUtil.isPointInside(handleRect, data.mousePositionOnViewPortContent)) {
                    store.dispatch(updateCustomCursorStyle(CustomCursorStyle.MOVE));
                    return;
                }
            } else if (this.isInProgress()) {
                store.dispatch(updateCustomCursorStyle(CustomCursorStyle.MOVE));
                return;
            }

            if (RectUtil.isPointInside(
                {x: 0, y: 0, ...CanvasUtil.getSize(this.canvas)},
                data.mousePositionOnViewPortContent
            )) {
                RenderEngineUtil.wrapDefaultCursorStyleInCancel(data);
                this.canvas.style.cursor = 'none';
            } else {
                this.canvas.style.cursor = 'default';
            }
        }
    }

    // =================================================================================================================
    // HELPERS
    // =================================================================================================================

    isInProgress() {
        return EditorModel.viewPortActionsDisabled;
    }

    getLabelPointUnderMouse(mousePosition, data) {
        const labelPoints = LabelsSelector
            .getActiveImageData()
            .labelPoints
            .filter((labelPoint) => labelPoint.isVisible);
        for (const labelPoint of labelPoints) {
            const pointOnCanvas = RenderEngineUtil.transferPointFromImageToViewPortContent(labelPoint.point, data);
            const handleRect = RectUtil.getRectWithCenterAndSize(pointOnCanvas, RenderEngineSettings.anchorHoverSize);
            if (RectUtil.isPointInside(handleRect, mousePosition)) {
                return labelPoint;
            }
        }
        return null;
    }

    addPointLabel = (point) => {
        const activeLabelId = LabelsSelector.getActiveLabelNameId();
        const imageData = LabelsSelector.getActiveImageData();
        const labelPoint = LabelUtil.createLabelPoint(activeLabelId, point);
        imageData.labelPoints.push(labelPoint);
        store.dispatch(updateImageDataById(imageData.id, imageData));
        store.dispatch(updateFirstLabelCreatedFlag(true));
        store.dispatch(updateActiveLabelId(labelPoint.id));
    };
}
