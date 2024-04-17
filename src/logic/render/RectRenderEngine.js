import {RectUtil} from '../../utils/RectUtil';
import {DrawUtil} from '../../utils/DrawUtil';
import {store} from '../..';
import {
    updateActiveLabelId,
    updateFirstLabelCreatedFlag,
    updateHighlightedLabelId,
    updateImageDataById
} from '../../store/labels/actionCreators';
import {PointUtil} from '../../utils/PointUtil';
import {RenderEngineSettings} from '../../settings/RenderEngineSettings';
import {updateCustomCursorStyle} from '../../store/general/actionCreators';
import {CustomCursorStyle} from '../../data/enums/CustomCursorStyle';
import {LabelsSelector} from '../../store/selectors/LabelsSelector';
import {BaseRenderEngine} from './BaseRenderEngine';
import {RenderEngineUtil} from '../../utils/RenderEngineUtil';
import {LabelType} from '../../data/enums/LabelType';
import {EditorActions} from '../actions/EditorActions';
import {GeneralSelector} from '../../store/selectors/GeneralSelector';
import {LabelStatus} from '../../data/enums/LabelStatus';
import {LabelUtil} from '../../utils/LabelUtil';

export class RectRenderEngine extends BaseRenderEngine {
    constructor(canvas) {
        super(canvas);
        this.labelType = LabelType.RECT;
    }

    // =================================================================================================================
    // EVENT HANDLERS
    // =================================================================================================================

    mouseDownHandler = (data) => {
        const isMouseOverImage = RenderEngineUtil.isMouseOverImage(data);
        const isMouseOverCanvas = RenderEngineUtil.isMouseOverCanvas(data);
        if (isMouseOverCanvas) {
            const rectUnderMouse = this.getRectUnderMouse(data);
            if (!!rectUnderMouse) {
                const rect = this.calculateRectRelativeToActiveImage(rectUnderMouse.rect, data);
                const anchorUnderMouse = this.getAnchorUnderMouseByRect(rect, data.mousePositionOnViewPortContent, data.viewPortContentImageRect);
                if (!!anchorUnderMouse && rectUnderMouse.status === LabelStatus.ACCEPTED) {
                    store.dispatch(updateActiveLabelId(rectUnderMouse.id));
                    this.startRectResize(anchorUnderMouse);
                } else {
                    if (!!LabelsSelector.getHighlightedLabelId())
                        store.dispatch(updateActiveLabelId(LabelsSelector.getHighlightedLabelId()));
                    else
                        this.startRectCreation(data.mousePositionOnViewPortContent);
                }
            } else if (isMouseOverImage) {

                this.startRectCreation(data.mousePositionOnViewPortContent);
            }
        }
    };

    mouseUpHandler = (data) => {
        if (!!data.viewPortContentImageRect) {
            const mousePositionSnapped = RectUtil.snapPointToRect(data.mousePositionOnViewPortContent, data.viewPortContentImageRect);
            const activeLabelRect = LabelsSelector.getActiveRectLabel();

            if (!!this.startCreateRectPoint && !PointUtil.equals(this.startCreateRectPoint, mousePositionSnapped)) {

                const minX = Math.min(this.startCreateRectPoint.x, mousePositionSnapped.x);
                const minY = Math.min(this.startCreateRectPoint.y, mousePositionSnapped.y);
                const maxX = Math.max(this.startCreateRectPoint.x, mousePositionSnapped.x);
                const maxY = Math.max(this.startCreateRectPoint.y, mousePositionSnapped.y);

                const rect = {x: minX, y: minY, width: maxX - minX, height: maxY - minY};
                this.addRectLabel(RenderEngineUtil.transferRectFromImageToViewPortContent(rect, data));
            }

            if (!!this.startResizeRectAnchor && !!activeLabelRect) {
                const rect = this.calculateRectRelativeToActiveImage(activeLabelRect.rect, data);
                const startAnchorPosition = PointUtil.add(this.startResizeRectAnchor.position, data.viewPortContentImageRect);
                const delta = PointUtil.subtract(mousePositionSnapped, startAnchorPosition);
                const resizeRect = RectUtil.resizeRect(rect, this.startResizeRectAnchor.type, delta);
                const scale = RenderEngineUtil.calculateImageScale(data);
                const scaledRect = RectUtil.scaleRect(resizeRect, scale);

                const imageData = LabelsSelector.getActiveImageData();
                imageData.labelRects = imageData.labelRects.map((labelRect) => {
                    if (labelRect.id === activeLabelRect.id) {
                        return {
                            ...labelRect,
                            rect: scaledRect
                        };
                    }
                    return labelRect;
                });
                store.dispatch(updateImageDataById(imageData.id, imageData));
            }
        }
        this.endRectTransformation()
    };

    mouseMoveHandler = (data) => {
        if (!!data.viewPortContentImageRect && !!data.mousePositionOnViewPortContent) {
            const isOverImage = RenderEngineUtil.isMouseOverImage(data);
            if (isOverImage && !this.startResizeRectAnchor) {
                const labelRect = this.getRectUnderMouse(data);
                if (!!labelRect && !this.isInProgress()) {
                    if (LabelsSelector.getHighlightedLabelId() !== labelRect.id) {
                        store.dispatch(updateHighlightedLabelId(labelRect.id))
                    }
                } else {
                    if (LabelsSelector.getHighlightedLabelId() !== null) {
                        store.dispatch(updateHighlightedLabelId(null))
                    }
                }
            }
        }
    };

    // =================================================================================================================
    // RENDERING
    // =================================================================================================================

    render(data) {
        const activeLabelId = LabelsSelector.getActiveLabelId();
        const imageData = LabelsSelector.getActiveImageData();
        if (imageData) {
            imageData.labelRects.forEach((labelRect) => {
                if (labelRect.isVisible) {
                    if (labelRect.status === LabelStatus.ACCEPTED && labelRect.id === activeLabelId) {
                        this.drawActiveRect(labelRect, data)
                    } else {
                        this.drawInactiveRect(labelRect, data);
                    }
                }
            });
            this.drawCurrentlyCreatedRect(data.mousePositionOnViewPortContent, data.viewPortContentImageRect);
            this.updateCursorStyle(data);
        }
    }

    drawCurrentlyCreatedRect(mousePosition, imageRect) {
        if (!!this.startCreateRectPoint) {
            const mousePositionSnapped = RectUtil.snapPointToRect(mousePosition, imageRect);
            const activeRect = {
                x: this.startCreateRectPoint.x,
                y: this.startCreateRectPoint.y,
                width: mousePositionSnapped.x - this.startCreateRectPoint.x,
                height: mousePositionSnapped.y - this.startCreateRectPoint.y
            };
            const activeRectBetweenPixels = RenderEngineUtil.setRectBetweenPixels(activeRect);
            const lineColor = BaseRenderEngine.resolveLabelLineColor(null, true)
            DrawUtil.drawRect(
                this.canvas,
                activeRectBetweenPixels,
                lineColor,
                RenderEngineSettings.LINE_THICKNESS
            );
        }
    }

    drawInactiveRect(labelRect, data) {
        const rectOnImage = RenderEngineUtil.transferRectFromViewPortContentToImage(labelRect.rect, data)
        const highlightedLabelId = LabelsSelector.getHighlightedLabelId()
        const displayAsActive = labelRect.status === LabelStatus.ACCEPTED && labelRect.id === highlightedLabelId;
        const lineColor = BaseRenderEngine.resolveLabelLineColor(labelRect.labelId, displayAsActive)
        const anchorColor = BaseRenderEngine.resolveLabelAnchorColor(displayAsActive);
        this.renderRect(rectOnImage, displayAsActive, lineColor, anchorColor);
    }

    drawActiveRect(labelRect, data) {
        let rect = this.calculateRectRelativeToActiveImage(labelRect.rect, data);
        if (!!this.startResizeRectAnchor) {
            const startAnchorPosition = PointUtil.add(this.startResizeRectAnchor.position, data.viewPortContentImageRect);
            const endAnchorPositionSnapped = RectUtil.snapPointToRect(data.mousePositionOnViewPortContent, data.viewPortContentImageRect);
            const delta = PointUtil.subtract(endAnchorPositionSnapped, startAnchorPosition);
            rect = RectUtil.resizeRect(rect, this.startResizeRectAnchor.type, delta);
        }
        const rectOnImage = RectUtil.translate(rect, data.viewPortContentImageRect);
        const lineColor = BaseRenderEngine.resolveLabelLineColor(labelRect.labelId, true)
        const anchorColor = BaseRenderEngine.resolveLabelAnchorColor(true);
        this.renderRect(rectOnImage, true, lineColor, anchorColor);
    }

    renderRect(rectOnImage, isActive, lineColor, anchorColor) {
        const rectBetweenPixels = RenderEngineUtil.setRectBetweenPixels(rectOnImage);
        DrawUtil.drawRectWithFill(this.canvas, rectBetweenPixels, DrawUtil.hexToRGB(lineColor, 0.2));
        DrawUtil.drawRect(
            this.canvas,
            rectBetweenPixels,
            lineColor,
            RenderEngineSettings.LINE_THICKNESS
        );
        if (isActive) {
            const handleCenters = RectUtil.mapRectToAnchors(rectOnImage).map((rectAnchor) => rectAnchor.position);
            handleCenters.forEach((center) => {
                const handleRect = RectUtil.getRectWithCenterAndSize(center, RenderEngineSettings.anchorSize);
                const handleRectBetweenPixels = RenderEngineUtil.setRectBetweenPixels(handleRect);
                DrawUtil.drawRectWithFill(this.canvas, handleRectBetweenPixels, anchorColor);
            })
        }
    }

    updateCursorStyle(data) {
        if (!!this.canvas && !!data.mousePositionOnViewPortContent && !GeneralSelector.getImageDragModeStatus()) {
            const rectUnderMouse = this.getRectUnderMouse(data);
            const rectAnchorUnderMouse = this.getAnchorUnderMouse(data);
            if ((!!rectAnchorUnderMouse && rectUnderMouse && rectUnderMouse.status === LabelStatus.ACCEPTED) || !!this.startResizeRectAnchor) {
                store.dispatch(updateCustomCursorStyle(CustomCursorStyle.MOVE));
                return;
            }
            else if (RenderEngineUtil.isMouseOverCanvas(data)) {
                if (!RenderEngineUtil.isMouseOverImage(data) && !!this.startCreateRectPoint)
                    store.dispatch(updateCustomCursorStyle(CustomCursorStyle.MOVE));
                else
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
        return !!this.startCreateRectPoint || !!this.startResizeRectAnchor;
    }

    calculateRectRelativeToActiveImage(rect, data) {
        const scale = RenderEngineUtil.calculateImageScale(data);
        return RectUtil.scaleRect(rect, 1/scale);
    }

    addRectLabel = (rect) => {
        const activeLabelId = LabelsSelector.getActiveLabelNameId();
        const imageData = LabelsSelector.getActiveImageData();
        const labelRect = LabelUtil.createLabelRect(activeLabelId, rect);
        imageData.labelRects.push(labelRect);
        store.dispatch(updateImageDataById(imageData.id, imageData));
        store.dispatch(updateFirstLabelCreatedFlag(true));
        store.dispatch(updateActiveLabelId(labelRect.id));
    };

    getRectUnderMouse(data) {
        const activeRectLabel = LabelsSelector.getActiveRectLabel();
        if (!!activeRectLabel && activeRectLabel.isVisible && this.isMouseOverRectEdges(activeRectLabel.rect, data)) {
            return activeRectLabel;
        }

        const labelRects = LabelsSelector.getActiveImageData().labelRects;
        for (const labelRect of labelRects) {
            if (labelRect.isVisible && this.isMouseOverRectEdges(labelRect.rect, data)) {
                return labelRect;
            }
        }
        return null;
    }

    isMouseOverRectEdges(rect, data) {
        const rectOnImage = RectUtil.translate(
            this.calculateRectRelativeToActiveImage(rect, data),
            data.viewPortContentImageRect
        );

        const outerRectDelta = {
            x: RenderEngineSettings.anchorHoverSize.width / 2,
            y: RenderEngineSettings.anchorHoverSize.height / 2
        };
        const outerRect = RectUtil.expand(rectOnImage, outerRectDelta);

        const innerRectDelta = {
            x: - RenderEngineSettings.anchorHoverSize.width / 2,
            y: - RenderEngineSettings.anchorHoverSize.height / 2
        };
        const innerRect = RectUtil.expand(rectOnImage, innerRectDelta);

        return RectUtil.isPointInside(outerRect, data.mousePositionOnViewPortContent) &&
            !RectUtil.isPointInside(innerRect, data.mousePositionOnViewPortContent);
    }

    getAnchorUnderMouseByRect(rect, mousePosition, imageRect) {
        const rectAnchors = RectUtil.mapRectToAnchors(rect);
        for (let i = 0; i < rectAnchors.length; i++) {
            const anchorRect = RectUtil.translate(
                RectUtil.getRectWithCenterAndSize(rectAnchors[i].position, RenderEngineSettings.anchorHoverSize),
                imageRect
            );
            if (!!mousePosition && RectUtil.isPointInside(anchorRect, mousePosition)) {
                return rectAnchors[i];
            }
        }
        return null;
    }

    getAnchorUnderMouse(data) {
        const labelRects = LabelsSelector.getActiveImageData().labelRects;
        for (let i = 0; i < labelRects.length; i++) {
            const rect = this.calculateRectRelativeToActiveImage(labelRects[i].rect, data);
            const rectAnchor = this.getAnchorUnderMouseByRect(rect, data.mousePositionOnViewPortContent, data.viewPortContentImageRect);
            if (!!rectAnchor) return rectAnchor;
        }
        return null;
    }

    startRectCreation(mousePosition) {
        this.startCreateRectPoint = mousePosition;
        store.dispatch(updateActiveLabelId(null));
        EditorActions.setViewPortActionsDisabledStatus(true);
    }

    startRectResize(activatedAnchor) {
        this.startResizeRectAnchor = activatedAnchor;
        EditorActions.setViewPortActionsDisabledStatus(true);
    }

    endRectTransformation() {
        this.startCreateRectPoint = null;
        this.startResizeRectAnchor = null;
        EditorActions.setViewPortActionsDisabledStatus(false);
    }
}
