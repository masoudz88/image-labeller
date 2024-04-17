import {store} from '../../index';
import {RectUtil} from '../../utils/RectUtil';
import {updateCustomCursorStyle} from '../../store/general/actionCreators';
import {CustomCursorStyle} from '../../data/enums/CustomCursorStyle';
import {BaseRenderEngine} from './BaseRenderEngine';
import {RenderEngineSettings} from '../../settings/RenderEngineSettings';
import {DrawUtil} from '../../utils/DrawUtil';
import {LabelsSelector} from '../../store/selectors/LabelsSelector';
import {
    updateActiveLabelId,
    updateFirstLabelCreatedFlag,
    updateHighlightedLabelId,
    updateImageDataById
} from '../../store/labels/actionCreators';
import {LineUtil} from '../../utils/LineUtil';
import {MouseEventUtil} from '../../utils/MouseEventUtil';
import {EventType} from '../../data/enums/EventType';
import {RenderEngineUtil} from '../../utils/RenderEngineUtil';
import {LabelType} from '../../data/enums/LabelType';
import {EditorActions} from '../actions/EditorActions';
import {GeneralSelector} from '../../store/selectors/GeneralSelector';
import {Settings} from '../../settings/Settings';
import {LabelUtil} from '../../utils/LabelUtil';
import {PolygonUtil} from '../../utils/PolygonUtil';

export class PolygonRenderEngine extends BaseRenderEngine {

    // =================================================================================================================
    // STATE
    // =================================================================================================================

    activePath = [];
    resizeAnchorIndex = null;
    suggestedAnchorPositionOnCanvas = null;
    suggestedAnchorIndexInPolygon = null;

    constructor(canvas) {
        super(canvas);
        this.labelType = LabelType.POLYGON;
    }

    // =================================================================================================================
    // EVENT HANDLERS
    // =================================================================================================================

    update(data) {
        if (!!data.event) {
            switch (MouseEventUtil.getEventType(data.event)) {
                case EventType.MOUSE_MOVE:
                    this.mouseMoveHandler(data);
                    break;
                case EventType.MOUSE_UP:
                    this.mouseUpHandler(data);
                    break;
                case EventType.MOUSE_DOWN:
                    this.mouseDownHandler(data);
                    break;
                default:
                    break;
            }
        }
    }

    mouseDownHandler(data) {
        const isMouseOverCanvas = RenderEngineUtil.isMouseOverCanvas(data);
        if (isMouseOverCanvas) {
            if (this.isCreationInProgress()) {
                const isMouseOverStartAnchor = this.isMouseOverAnchor(data.mousePositionOnViewPortContent, this.activePath[0]);
                if (isMouseOverStartAnchor) {
                    this.addLabelAndFinishCreation(data);
                } else  {
                    this.updateActivelyCreatedLabel(data);
                }
            } else {
                const polygonUnderMouse = this.getPolygonUnderMouse(data);
                if (!!polygonUnderMouse) {
                    const anchorIndex = polygonUnderMouse.vertices.reduce((indexUnderMouse, anchor, index) => {
                    if (indexUnderMouse === null) {
                        const anchorOnCanvas = RenderEngineUtil.transferPointFromImageToViewPortContent(anchor, data);
                        if (this.isMouseOverAnchor(data.mousePositionOnViewPortContent, anchorOnCanvas)) {
                            return index;
                        }
                    }
                    return indexUnderMouse;
                }, null);

                    if (anchorIndex !== null) {
                        this.startExistingLabelResize(data, polygonUnderMouse.id, anchorIndex);
                    } else {
                        store.dispatch(updateActiveLabelId(polygonUnderMouse.id));
                        const isMouseOverNewAnchor = this.isMouseOverAnchor(data.mousePositionOnViewPortContent, this.suggestedAnchorPositionOnCanvas);
                        if (isMouseOverNewAnchor) {
                            this.addSuggestedAnchorToPolygonLabel(data);
                        }
                    }
                } else {
                    this.updateActivelyCreatedLabel(data);
                }
            }
        }
    }

    mouseUpHandler(data) {
        if (this.isResizeInProgress())
            this.endExistingLabelResize(data);
    }

    mouseMoveHandler(data) {
        if (!!data.viewPortContentImageRect && !!data.mousePositionOnViewPortContent) {
            const isOverImage = RenderEngineUtil.isMouseOverImage(data);
            if (isOverImage && !this.isCreationInProgress()) {
                const labelPolygon = this.getPolygonUnderMouse(data);
                if (!!labelPolygon && !this.isResizeInProgress()) {
                    if (LabelsSelector.getHighlightedLabelId() !== labelPolygon.id) {
                        store.dispatch(updateHighlightedLabelId(labelPolygon.id))
                    }
                    const pathOnCanvas = RenderEngineUtil.transferPolygonFromImageToViewPortContent(labelPolygon.vertices, data);
                    const linesOnCanvas = PolygonUtil.getEdges(pathOnCanvas);

                    for (let j = 0; j < linesOnCanvas.length; j++) {
                        const mouseOverLine = RenderEngineUtil.isMouseOverLine(
                            data.mousePositionOnViewPortContent,
                            linesOnCanvas[j],
                            RenderEngineSettings.anchorHoverSize.width / 2
                        )
                        if (mouseOverLine) {
                            this.suggestedAnchorPositionOnCanvas = LineUtil.getCenter(linesOnCanvas[j]);
                            this.suggestedAnchorIndexInPolygon = j + 1;
                            break;
                        }
                    }
                } else {
                    if (LabelsSelector.getHighlightedLabelId() !== null) {
                        store.dispatch(updateHighlightedLabelId(null));
                        this.discardSuggestedPoint();
                    }
                }
            }
        }
    }

    // =================================================================================================================
    // RENDERING
    // =================================================================================================================

    render(data) {
        const imageData = LabelsSelector.getActiveImageData();
        if (imageData) {
            this.drawExistingLabels(data);
            this.drawActivelyCreatedLabel(data);
            this.drawActivelyResizeLabel(data);
            this.updateCursorStyle(data);
            this.drawSuggestedAnchor(data);
        }
    }

    updateCursorStyle(data) {
        if (!!this.canvas && !!data.mousePositionOnViewPortContent && !GeneralSelector.getImageDragModeStatus()) {
            const isMouseOverCanvas = RenderEngineUtil.isMouseOverCanvas(data);
            if (isMouseOverCanvas) {
                if (this.isCreationInProgress()) {
                    const isMouseOverStartAnchor = this.isMouseOverAnchor(data.mousePositionOnViewPortContent, this.activePath[0]);
                    if (isMouseOverStartAnchor && this.activePath.length > 2)
                        store.dispatch(updateCustomCursorStyle(CustomCursorStyle.CLOSE));
                    else
                        store.dispatch(updateCustomCursorStyle(CustomCursorStyle.DEFAULT));
                } else {
                    const anchorUnderMouse = this.getAnchorUnderMouse(data);
                    const isMouseOverNewAnchor = this.isMouseOverAnchor(data.mousePositionOnViewPortContent, this.suggestedAnchorPositionOnCanvas);
                    if (!!isMouseOverNewAnchor) {
                        store.dispatch(updateCustomCursorStyle(CustomCursorStyle.ADD));
                    } else if (this.isResizeInProgress()) {
                        store.dispatch(updateCustomCursorStyle(CustomCursorStyle.MOVE));
                    } else if (!!anchorUnderMouse) {
                        store.dispatch(updateCustomCursorStyle(CustomCursorStyle.MOVE));
                    } else {
                        RenderEngineUtil.wrapDefaultCursorStyleInCancel(data);
                    }
                }
                this.canvas.style.cursor = 'none';
            } else {
                this.canvas.style.cursor = 'default';
            }
        }
    }

    drawActivelyCreatedLabel(data) {
        const standardizedPoints = this.activePath.map((point) => RenderEngineUtil.setPointBetweenPixels(point));
        const path = standardizedPoints.concat(data.mousePositionOnViewPortContent);
        const lines = PolygonUtil.getEdges(path, false);
        const lineColor = BaseRenderEngine.resolveLabelLineColor(null, true)
        const anchorColor = BaseRenderEngine.resolveLabelAnchorColor(true)
        DrawUtil.drawPolygonWithFill(this.canvas, path, DrawUtil.hexToRGB(lineColor, 0.2));
        lines.forEach((line) => {
            DrawUtil.drawLine(
                this.canvas,
                line.start,
                line.end,
                lineColor,
                RenderEngineSettings.LINE_THICKNESS
            );
        });
        standardizedPoints.forEach((point) => {
            DrawUtil.drawCircleWithFill(this.canvas, point, Settings.RESIZE_HANDLE_DIMENSION_PX/2, anchorColor);
        })
    }

    drawActivelyResizeLabel(data) {
        const activeLabelPolygon = LabelsSelector.getActivePolygonLabel();
        if (!!activeLabelPolygon && this.isResizeInProgress()) {
            const snappedMousePosition = RectUtil.snapPointToRect(data.mousePositionOnViewPortContent, data.viewPortContentImageRect);
            const polygonOnCanvas = activeLabelPolygon.vertices.map((point, index) => {
                return index === this.resizeAnchorIndex ? snappedMousePosition : RenderEngineUtil.transferPointFromImageToViewPortContent(point, data);
            });
            this.drawPolygon(activeLabelPolygon.labelId, polygonOnCanvas, true);
        }
    }

    drawExistingLabels(data) {
        const activeLabelId = LabelsSelector.getActiveLabelId();
        const highlightedLabelId = LabelsSelector.getHighlightedLabelId();
        const imageData = LabelsSelector.getActiveImageData();
        imageData.labelPolygons.forEach((labelPolygon) => {
            if (labelPolygon.isVisible) {
                const isActive = labelPolygon.id === activeLabelId || labelPolygon.id === highlightedLabelId;
                const pathOnCanvas = RenderEngineUtil.transferPolygonFromImageToViewPortContent(labelPolygon.vertices, data);
                if (!(labelPolygon.id === activeLabelId && this.isResizeInProgress())) {
                    this.drawPolygon(labelPolygon.labelId, pathOnCanvas, isActive);
                }
            }
        });
    }

    drawPolygon(labelId, polygon, isActive) {
        const lineColor = BaseRenderEngine.resolveLabelLineColor(labelId, true)
        const anchorColor = BaseRenderEngine.resolveLabelAnchorColor(true)
        const standardizedPoints = polygon.map((point) => RenderEngineUtil.setPointBetweenPixels(point));
        if (isActive) {
            DrawUtil.drawPolygonWithFill(this.canvas, standardizedPoints, DrawUtil.hexToRGB(lineColor, 0.2));
        }
        DrawUtil.drawPolygon(
            this.canvas,
            standardizedPoints,
            lineColor,
            RenderEngineSettings.LINE_THICKNESS
        );
        if (isActive) {
            standardizedPoints.forEach((point) => {
                DrawUtil.drawCircleWithFill(this.canvas, point, Settings.RESIZE_HANDLE_DIMENSION_PX/2, anchorColor);
            })
        }
    }

    drawSuggestedAnchor(data) {
        const anchorColor = BaseRenderEngine.resolveLabelAnchorColor(true)
        if (this.suggestedAnchorPositionOnCanvas) {
            const suggestedAnchorRect = RectUtil
                .getRectWithCenterAndSize(
                this.suggestedAnchorPositionOnCanvas,
                RenderEngineSettings.suggestedAnchorDetectionSize
            );
            const isMouseOverSuggestedAnchor = RectUtil.isPointInside(suggestedAnchorRect, data.mousePositionOnViewPortContent);

            if (isMouseOverSuggestedAnchor) {
                DrawUtil.drawCircleWithFill(
                    this.canvas,
                    this.suggestedAnchorPositionOnCanvas,
                    Settings.RESIZE_HANDLE_DIMENSION_PX/2,
                    anchorColor
                );
            }
        }
    }

    // =================================================================================================================
    // CREATION
    // =================================================================================================================

    updateActivelyCreatedLabel(data) {
        if (this.isCreationInProgress()) {
            const mousePositionSnapped = RectUtil.snapPointToRect(data.mousePositionOnViewPortContent, data.viewPortContentImageRect);
            this.activePath.push(mousePositionSnapped);
        } else {
            const isMouseOverImage = RectUtil.isPointInside(data.viewPortContentImageRect, data.mousePositionOnViewPortContent);
            if (isMouseOverImage) {
                EditorActions.setViewPortActionsDisabledStatus(true);
                this.activePath.push(data.mousePositionOnViewPortContent);
                store.dispatch(updateActiveLabelId(null));
            }
        }
    }

    cancelLabelCreation() {
        this.activePath = [];
        EditorActions.setViewPortActionsDisabledStatus(false);
    }

    finishLabelCreation() {
        this.activePath = [];
        EditorActions.setViewPortActionsDisabledStatus(false);
    }

    addLabelAndFinishCreation(data) {
        if (this.isCreationInProgress() && this.activePath.length > 2) {
            const polygonOnImage = RenderEngineUtil.transferPolygonFromViewPortContentToImage(this.activePath, data);
            this.addPolygonLabel(polygonOnImage);
            this.finishLabelCreation();
        }
    }

    addPolygonLabel(polygon) {
        const activeLabelId = LabelsSelector.getActiveLabelNameId();
        const imageData = LabelsSelector.getActiveImageData();
        const labelPolygon = LabelUtil.createLabelPolygon(activeLabelId, polygon);
        imageData.labelPolygons.push(labelPolygon);
        store.dispatch(updateImageDataById(imageData.id, imageData));
        store.dispatch(updateFirstLabelCreatedFlag(true));
        store.dispatch(updateActiveLabelId(labelPolygon.id));
    };

    // =================================================================================================================
    // TRANSFER
    // =================================================================================================================

    startExistingLabelResize(data, labelId, anchorIndex) {
        store.dispatch(updateActiveLabelId(labelId));
        this.resizeAnchorIndex = anchorIndex;
        EditorActions.setViewPortActionsDisabledStatus(true);
    }

    endExistingLabelResize(data) {
        this.applyResizeToPolygonLabel(data);
        this.resizeAnchorIndex = null;
        EditorActions.setViewPortActionsDisabledStatus(false);
    }

    applyResizeToPolygonLabel(data) {
        const imageData = LabelsSelector.getActiveImageData();
        const activeLabel = LabelsSelector.getActivePolygonLabel();
        imageData.labelPolygons = imageData.labelPolygons.map((polygon) => {
            if (polygon.id !== activeLabel.id) {
                return polygon
            } else {
                return {
                    ...polygon,
                    vertices: polygon.vertices.map((value, index) => {
                        if (index !== this.resizeAnchorIndex) {
                            return value;
                        } else {
                            const snappedMousePosition =
                                RectUtil.snapPointToRect(data.mousePositionOnViewPortContent, data.viewPortContentImageRect);
                            return RenderEngineUtil.transferPointFromViewPortContentToImage(snappedMousePosition, data);
                        }
                    })
                };
            }
        });
        store.dispatch(updateImageDataById(imageData.id, imageData));
        store.dispatch(updateActiveLabelId(activeLabel.id));
    }

    discardSuggestedPoint() {
        this.suggestedAnchorIndexInPolygon = null;
        this.suggestedAnchorPositionOnCanvas = null;
    }

    // =================================================================================================================
    // UPDATE
    // =================================================================================================================

    addSuggestedAnchorToPolygonLabel(data) {
        const imageData = LabelsSelector.getActiveImageData();
        const activeLabel = LabelsSelector.getActivePolygonLabel();
        const newAnchorPositionOnImage =
            RenderEngineUtil.transferPointFromViewPortContentToImage(this.suggestedAnchorPositionOnCanvas, data);
        const insert = (arr, index, newItem) => [...arr.slice(0, index), newItem, ...arr.slice(index)];

        const newImageData = {
            ...imageData,
            labelPolygons: imageData.labelPolygons.map((polygon) => {
                if (polygon.id !== activeLabel.id) {
                    return polygon
                } else {
                    return {
                        ...polygon,
                        vertices: insert(
                            polygon.vertices,
                            this.suggestedAnchorIndexInPolygon,
                            newAnchorPositionOnImage
                        )
                    };
                }
            })
        };

        store.dispatch(updateImageDataById(newImageData.id, newImageData));
        this.startExistingLabelResize(data, activeLabel.id, this.suggestedAnchorIndexInPolygon);
        this.discardSuggestedPoint();
    }

    // =================================================================================================================
    // VALIDATORS
    // =================================================================================================================

    isInProgress() {
        return this.isCreationInProgress() || this.isResizeInProgress();
    }

    isCreationInProgress() {
        return this.activePath !== null && this.activePath.length !== 0;
    }

    isResizeInProgress() {
        return this.resizeAnchorIndex !== null;
    }

    isMouseOverAnchor(mouse, anchor) {
        if (!mouse || !anchor) return null;
        return RectUtil.isPointInside(
            RectUtil.getRectWithCenterAndSize(anchor, RenderEngineSettings.anchorSize),
            mouse
        );
    }

    // =================================================================================================================
    // GETTERS
    // =================================================================================================================

    getPolygonUnderMouse(data) {
        const mouseOnCanvas = data.mousePositionOnViewPortContent;
        if (!mouseOnCanvas) return null;

        const labelPolygons = LabelsSelector
            .getActiveImageData()
            .labelPolygons
            .filter((labelPolygon) => labelPolygon.isVisible);
        const radius = RenderEngineSettings.anchorHoverSize.width / 2;

        for (const labelPolygon of labelPolygons) {
            const verticesOnCanvas = RenderEngineUtil
                .transferPolygonFromImageToViewPortContent(labelPolygon.vertices, data);
            if (RenderEngineUtil.isMouseOverPolygon(mouseOnCanvas, verticesOnCanvas, radius)) {
                return labelPolygon;
            }
        }
        return null;
    }

    getAnchorUnderMouse(data) {
        const mouseOnCanvas = data.mousePositionOnViewPortContent;
        if (!mouseOnCanvas) return null;

        const labelPolygons = LabelsSelector
            .getActiveImageData()
            .labelPolygons
            .filter((labelPolygon) => labelPolygon.isVisible);
        const radius = RenderEngineSettings.anchorHoverSize.width / 2;

        for (const labelPolygon of labelPolygons) {
            const verticesOnCanvas = RenderEngineUtil
                .transferPolygonFromImageToViewPortContent(labelPolygon.vertices, data);
            for (const vertexOnCanvas of verticesOnCanvas) {
                if (RenderEngineUtil.isMouseOverAnchor(mouseOnCanvas, vertexOnCanvas, radius)) return vertexOnCanvas;
            }
        }
        return null;
    }
}
