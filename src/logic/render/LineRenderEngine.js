import {BaseRenderEngine} from './BaseRenderEngine';
import {RenderEngineSettings} from '../../settings/RenderEngineSettings';
import {LabelType} from '../../data/enums/LabelType';
import {RenderEngineUtil} from '../../utils/RenderEngineUtil';
import {RectUtil} from '../../utils/RectUtil';
import {store} from '../../index';
import {
    updateActiveLabelId,
    updateFirstLabelCreatedFlag,
    updateHighlightedLabelId,
    updateImageDataById
} from '../../store/labels/actionCreators';
import {EditorActions} from '../actions/EditorActions';
import {LabelsSelector} from '../../store/selectors/LabelsSelector';
import {DrawUtil} from '../../utils/DrawUtil';
import {GeneralSelector} from '../../store/selectors/GeneralSelector';
import { v4 as uuidv4 } from 'uuid';
import {LineUtil} from '../../utils/LineUtil';
import {updateCustomCursorStyle} from '../../store/general/actionCreators';
import {CustomCursorStyle} from '../../data/enums/CustomCursorStyle';
import {LineAnchorType} from '../../data/enums/LineAnchorType';
import {Settings} from '../../settings/Settings';

export class LineRenderEngine extends BaseRenderEngine {
    constructor(canvas) {
        super(canvas);
        this.labelType = LabelType.LINE;
    }

    // =================================================================================================================
    // EVENT HANDLERS
    // =================================================================================================================

    mouseDownHandler(data) {
        const isMouseOverImage = RenderEngineUtil.isMouseOverImage(data);
        const isMouseOverCanvas = RenderEngineUtil.isMouseOverCanvas(data);
        const anchorTypeUnderMouse = this.getAnchorTypeUnderMouse(data);
        const labelLineUnderMouse = this.getLineUnderMouse(data);

        if (isMouseOverCanvas) {
            if (!!anchorTypeUnderMouse && !this.isResizeInProgress()) {
                this.startExistingLabelUpdate(labelLineUnderMouse.id, anchorTypeUnderMouse)
            } else if (labelLineUnderMouse !== null) {
                store.dispatch(updateActiveLabelId(labelLineUnderMouse.id));
            } else if (!this.isInProgress() && isMouseOverImage) {
                this.startNewLabelCreation(data)
            } else if (this.isInProgress()) {
                this.finishNewLabelCreation(data);
            }
        }
    }

    mouseUpHandler(data) {
        if (this.isResizeInProgress()) {
            this.endExistingLabelUpdate(data)
        }
    }

    mouseMoveHandler(data) {
        const isOverImage = RenderEngineUtil.isMouseOverImage(data);
        if (isOverImage) {
            const labelLine = this.getLineUnderMouse(data);
            if (!!labelLine) {
                if (LabelsSelector.getHighlightedLabelId() !== labelLine.id) {
                    store.dispatch(updateHighlightedLabelId(labelLine.id))
                }
            } else {
                if (LabelsSelector.getHighlightedLabelId() !== null) {
                    store.dispatch(updateHighlightedLabelId(null));
                }
            }
        }
    }

    // =================================================================================================================
    // RENDERING
    // =================================================================================================================

    render(data) {
        this.drawExistingLabels(data);
        this.drawActivelyCreatedLabel(data)
        this.drawActivelyResizeLabel(data)
        this.updateCursorStyle(data);
    }

    drawExistingLabels(data) {
        const activeLabelId = LabelsSelector.getActiveLabelId();
        const highlightedLabelId = LabelsSelector.getHighlightedLabelId();
        const imageData = LabelsSelector.getActiveImageData();
        imageData.labelLines.forEach((labelLine) => {
            if (labelLine.isVisible) {
                const isActive = labelLine.id === activeLabelId || labelLine.id === highlightedLabelId;
                const lineOnCanvas = RenderEngineUtil.transferLineFromImageToViewPortContent(labelLine.line, data)
                if (!(labelLine.id === activeLabelId && this.isResizeInProgress())) {
                    this.drawLine(labelLine.labelId, lineOnCanvas, isActive)
                }
            }
        });
    }

    drawActivelyCreatedLabel(data) {
        if (this.isInProgress()) {
            const line = {start: this.lineCreationStartPoint, end: data.mousePositionOnViewPortContent}
            DrawUtil.drawLine(
                this.canvas,
                line.start,
                line.end,
                RenderEngineSettings.lineActiveColor,
                RenderEngineSettings.LINE_THICKNESS
            );
            DrawUtil.drawCircleWithFill(
                this.canvas,
                this.lineCreationStartPoint,
                Settings.RESIZE_HANDLE_DIMENSION_PX/2,
                RenderEngineSettings.defaultAnchorColor
            )
        }
    }

    drawActivelyResizeLabel(data) {
        const activeLabelLine = LabelsSelector.getActiveLineLabel();
        if (!!activeLabelLine && this.isResizeInProgress()) {
            const snappedMousePosition =
                RectUtil.snapPointToRect(data.mousePositionOnViewPortContent, data.viewPortContentImageRect);
            const lineOnCanvas = RenderEngineUtil.transferLineFromImageToViewPortContent(activeLabelLine.line, data)
            const lineToDraw = {
                start: this.lineUpdateAnchorType === LineAnchorType.START ? snappedMousePosition : lineOnCanvas.start,
                end: this.lineUpdateAnchorType === LineAnchorType.END ? snappedMousePosition : lineOnCanvas.end
            }
            this.drawLine(activeLabelLine.labelId, lineToDraw, true)
        }
    }

    updateCursorStyle(data) {
        if (!!this.canvas && !!data.mousePositionOnViewPortContent && !GeneralSelector.getImageDragModeStatus()) {
            const isMouseOverCanvas = RenderEngineUtil.isMouseOverCanvas(data);
            if (isMouseOverCanvas) {
                const anchorTypeUnderMouse = this.getAnchorTypeUnderMouse(data);
                if (!this.isInProgress() && !!anchorTypeUnderMouse) {
                    store.dispatch(updateCustomCursorStyle(CustomCursorStyle.MOVE));
                } else if (this.isResizeInProgress()) {
                    store.dispatch(updateCustomCursorStyle(CustomCursorStyle.MOVE));
                } else {
                    RenderEngineUtil.wrapDefaultCursorStyleInCancel(data);
                }
                this.canvas.style.cursor = 'none';
            } else {
                this.canvas.style.cursor = 'default';
            }
        }
    }

    drawLine(labelId, line, isActive) {
        const lineColor = BaseRenderEngine.resolveLabelLineColor(labelId, isActive)
        const anchorColor = BaseRenderEngine.resolveLabelAnchorColor(isActive)
        const standardizedLine = {
            start: RenderEngineUtil.setPointBetweenPixels(line.start),
            end: RenderEngineUtil.setPointBetweenPixels(line.end)
        }
        DrawUtil.drawLine(
            this.canvas,
            standardizedLine.start,
            standardizedLine.end,
            lineColor,
            RenderEngineSettings.LINE_THICKNESS
        );
        if (isActive) {

            LineUtil
                .getPoints(line)
                .forEach(
                (point) => DrawUtil.drawCircleWithFill(this.canvas, point, Settings.RESIZE_HANDLE_DIMENSION_PX/2, anchorColor)
            )
        }
    }

    // =================================================================================================================
    // VALIDATORS
    // =================================================================================================================

    isInProgress() {
        return !!this.lineCreationStartPoint
    }

    isResizeInProgress() {
        return !!this.lineUpdateAnchorType;
    }

    // =================================================================================================================
    // CREATION
    // =================================================================================================================

    startNewLabelCreation = (data) => {
        this.lineCreationStartPoint = RenderEngineUtil.setPointBetweenPixels(data.mousePositionOnViewPortContent)
        EditorActions.setViewPortActionsDisabledStatus(true);
    };

    finishNewLabelCreation = (data) => {
        const mousePositionOnCanvasSnapped = RectUtil.snapPointToRect(data.mousePositionOnViewPortContent, data.viewPortContentImageRect);
        const lineOnCanvas = {start: this.lineCreationStartPoint, end: mousePositionOnCanvasSnapped}
        const lineOnImage = RenderEngineUtil.transferLineFromViewPortContentToImage(lineOnCanvas, data);
        const activeLabelId = LabelsSelector.getActiveLabelNameId();
        const imageData = LabelsSelector.getActiveImageData();
        const labelLine = {
            id: uuidv4(),
            labelId: activeLabelId,
            line: lineOnImage,
            isVisible: true
        };
        imageData.labelLines.push(labelLine);
        store.dispatch(updateImageDataById(imageData.id, imageData));
        store.dispatch(updateFirstLabelCreatedFlag(true));
        store.dispatch(updateActiveLabelId(labelLine.id));
        this.lineCreationStartPoint = null
        EditorActions.setViewPortActionsDisabledStatus(false);
    };

    cancelLabelCreation() {
        this.lineCreationStartPoint = null
        EditorActions.setViewPortActionsDisabledStatus(false);
    }

    // =================================================================================================================
    // UPDATE
    // =================================================================================================================

    startExistingLabelUpdate(labelId, anchorType) {
        store.dispatch(updateActiveLabelId(labelId));
        this.lineUpdateAnchorType = anchorType;
        EditorActions.setViewPortActionsDisabledStatus(true);
    }

    endExistingLabelUpdate(data) {
        this.applyUpdateToLineLabel(data);
        this.lineUpdateAnchorType = null;
        EditorActions.setViewPortActionsDisabledStatus(false);
    }

    applyUpdateToLineLabel(data) {
        const imageData = LabelsSelector.getActiveImageData();
        const activeLabel = LabelsSelector.getActiveLineLabel();
        imageData.labelLines = imageData.labelLines.map((lineLabel) => {
            if (lineLabel.id !== activeLabel.id) {
                return lineLabel
            } else {
                const snappedMousePosition =
                    RectUtil.snapPointToRect(data.mousePositionOnViewPortContent, data.viewPortContentImageRect);
                const mousePositionOnImage = RenderEngineUtil.transferPointFromViewPortContentToImage(snappedMousePosition, data);
                return {
                    ...lineLabel,
                    line: {
                        start: this.lineUpdateAnchorType === LineAnchorType.START ? mousePositionOnImage : lineLabel.line.start,
                        end: this.lineUpdateAnchorType === LineAnchorType.END ? mousePositionOnImage : lineLabel.line.end
                    }
                }
            }
        });

        store.dispatch(updateImageDataById(imageData.id, imageData));
        store.dispatch(updateActiveLabelId(activeLabel.id));
    }

    // =================================================================================================================
    // GETTERS
    // =================================================================================================================

    getLineUnderMouse(data) {
        const mouseOnCanvas = data.mousePositionOnViewPortContent;
        if (!mouseOnCanvas) return null;

        const labelLines = LabelsSelector
            .getActiveImageData()
            .labelLines
            .filter((labelLine) => labelLine.isVisible);
        const radius = RenderEngineSettings.anchorHoverSize.width / 2;

        for (const labelLine of labelLines) {
            const lineOnCanvas = RenderEngineUtil.transferLineFromImageToViewPortContent(labelLine.line, data);
            if (RenderEngineUtil.isMouseOverLine(mouseOnCanvas, lineOnCanvas, radius)) return labelLine;
        }
        return null;
    }

    getAnchorTypeUnderMouse(data) {
        const mouseOnCanvas = data.mousePositionOnViewPortContent;
        if (!mouseOnCanvas) return null;

        const labelLines = LabelsSelector
            .getActiveImageData()
            .labelLines
            .filter((labelLine) => labelLine.isVisible);
        const radius = RenderEngineSettings.anchorHoverSize.width / 2;

        for (const labelLine of labelLines) {
            const lineOnCanvas = RenderEngineUtil.transferLineFromImageToViewPortContent(labelLine.line, data);
            if (RenderEngineUtil.isMouseOverAnchor(mouseOnCanvas, lineOnCanvas.start, radius)) {
                return LineAnchorType.START
            }
            if (RenderEngineUtil.isMouseOverAnchor(mouseOnCanvas, lineOnCanvas.end, radius)) {
                return LineAnchorType.END
            }
        }
        return null;
    }
}
