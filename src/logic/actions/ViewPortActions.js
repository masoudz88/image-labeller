import {EditorModel} from '../../staticModels/EditorModel';
import {NumberUtil} from '../../utils/NumberUtil';
import {ViewPointSettings} from '../../settings/ViewPointSettings';
import {ImageUtil} from '../../utils/ImageUtil';
import {RectUtil} from '../../utils/RectUtil';
import {PointUtil} from '../../utils/PointUtil';
import {SizeUtil} from '../../utils/SizeUtil';
import {EditorActions} from './EditorActions';
import {DirectionUtil} from '../../utils/DirectionUtil';
import {GeneralSelector} from '../../store/selectors/GeneralSelector';
import {store} from '../../index';
import {updateZoom} from '../../store/general/actionCreators';

export class ViewPortActions {
    static updateViewPortSize() {
        if (!!EditorModel.editor) {
            EditorModel.viewPortSize = {
                width: EditorModel.editor.offsetWidth,
                height: EditorModel.editor.offsetHeight
            }
        }
    }

    static updateDefaultViewPortImageRect() {
        if (!!EditorModel.viewPortSize && !!EditorModel.image) {
            const minMargin = {
                x: ViewPointSettings.CANVAS_MIN_MARGIN_PX,
                y: ViewPointSettings.CANVAS_MIN_MARGIN_PX
            };
            const realImageRect = {x: 0, y: 0, ...ImageUtil.getSize(EditorModel.image)};
            const viewPortWithMarginRect = {x: 0, y: 0, ...EditorModel.viewPortSize};
            const viewPortWithoutMarginRect = RectUtil
                .expand(viewPortWithMarginRect, PointUtil.multiply(minMargin, -1));
            EditorModel.defaultRenderImageRect = RectUtil
                .fitInsideRectWithRatio(viewPortWithoutMarginRect, RectUtil.getRatio(realImageRect));
        }
    }

    static calculateViewPortContentSize() {
        if (!!EditorModel.viewPortSize && !!EditorModel.image) {
            const defaultViewPortImageRect = EditorModel.defaultRenderImageRect;
            const scaledImageSize = SizeUtil
                .scale(EditorModel.defaultRenderImageRect, GeneralSelector.getZoom());
            return {
                width: scaledImageSize.width + 2 * defaultViewPortImageRect.x,
                height: scaledImageSize.height + 2 * defaultViewPortImageRect.y
            }
        } else {
            return null;
        }
    }

    static calculateViewPortContentImageRect() {
        if (!!EditorModel.viewPortSize && !!EditorModel.image) {
            const defaultViewPortImageRect = EditorModel.defaultRenderImageRect;
            const viewPortContentSize = ViewPortActions.calculateViewPortContentSize();
            return {
                ...defaultViewPortImageRect,
                width: viewPortContentSize.width - 2 * defaultViewPortImageRect.x,
                height: viewPortContentSize.height - 2 * defaultViewPortImageRect.y
            }
        } else {
            return null;
        }
    }

    static resizeCanvas(newCanvasSize) {
        if (!!newCanvasSize && !!EditorModel.canvas) {
            EditorModel.canvas.width = newCanvasSize.width;
            EditorModel.canvas.height = newCanvasSize.height;
        }
    };

    static resizeViewPortContent() {
        const viewPortContentSize = ViewPortActions.calculateViewPortContentSize();
        if (viewPortContentSize) {
            ViewPortActions.resizeCanvas(viewPortContentSize);
        }
    }

    static calculateAbsoluteScrollPosition(relativePosition) {
        const viewPortContentSize = ViewPortActions.calculateViewPortContentSize();
        const viewPortSize = EditorModel.viewPortSize;
        return {
            x: relativePosition.x * (viewPortContentSize.width - viewPortSize.width),
            y: relativePosition.y * (viewPortContentSize.height - viewPortSize.height)
        };
    }

    static getRelativeScrollPosition() {
        if (!!EditorModel.viewPortScrollbars) {
            const values = EditorModel.viewPortScrollbars.getValues();
            return {
                x: values.left,
                y: values.top
            }
        } else {
            return null;
        }
    }

    static getAbsoluteScrollPosition() {
        if (!!EditorModel.viewPortScrollbars) {
            const values = EditorModel.viewPortScrollbars.getValues();
            return {
                x: values.scrollLeft,
                y: values.scrollTop
            }
        } else {
            return null;
        }
    }

    static setScrollPosition(position) {
        EditorModel.viewPortScrollbars.scrollLeft(position.x);
        EditorModel.viewPortScrollbars.scrollTop(position.y);
    }

    static translateViewPortPosition(direction) {
        if (EditorModel.viewPortActionsDisabled || GeneralSelector.getZoom() === ViewPointSettings.MIN_ZOOM) return;

        const directionVector = DirectionUtil.convertDirectionToVector(direction);
        const translationVector = PointUtil.multiply(directionVector, ViewPointSettings.TRANSLATION_STEP_PX);
        const currentScrollPosition = ViewPortActions.getAbsoluteScrollPosition();
        const nextScrollPosition = PointUtil.add(currentScrollPosition, translationVector);
        ViewPortActions.setScrollPosition(nextScrollPosition);
        EditorModel.mousePositionOnViewPortContent = PointUtil
            .add(EditorModel.mousePositionOnViewPortContent, translationVector);
        EditorActions.fullRender();
    }

    static zoomIn() {
        if (EditorModel.viewPortActionsDisabled) return;

        const currentZoom = GeneralSelector.getZoom();
        const currentRelativeScrollPosition = ViewPortActions.getRelativeScrollPosition();
        const nextRelativeScrollPosition = currentZoom === 1 ? {x: 0.5, y: 0.5} : currentRelativeScrollPosition;
        ViewPortActions.setZoom(currentZoom + ViewPointSettings.ZOOM_STEP);
        ViewPortActions.resizeViewPortContent();
        ViewPortActions.setScrollPosition(
            ViewPortActions.calculateAbsoluteScrollPosition(nextRelativeScrollPosition)
        );
        EditorActions.fullRender();
    }

    static zoomOut() {
        if (EditorModel.viewPortActionsDisabled) return;

        const currentZoom = GeneralSelector.getZoom();
        const currentRelativeScrollPosition = ViewPortActions.getRelativeScrollPosition();
        ViewPortActions.setZoom(currentZoom - ViewPointSettings.ZOOM_STEP);
        ViewPortActions.resizeViewPortContent();
        ViewPortActions.setScrollPosition(ViewPortActions
            .calculateAbsoluteScrollPosition(currentRelativeScrollPosition));
        EditorActions.fullRender();
    }

    static setDefaultZoom() {
        const currentRelativeScrollPosition = ViewPortActions.getRelativeScrollPosition();
        ViewPortActions.setZoom(ViewPointSettings.MIN_ZOOM);
        ViewPortActions.resizeViewPortContent();
        ViewPortActions.setScrollPosition(ViewPortActions
            .calculateAbsoluteScrollPosition(currentRelativeScrollPosition));
        EditorActions.fullRender();
    }

    static setOneForOneZoom() {
        const currentZoom = GeneralSelector.getZoom();
        const currentRelativeScrollPosition = ViewPortActions.getRelativeScrollPosition();
        const nextRelativeScrollPosition = currentZoom === 1 ? {x: 0.5, y: 0.5} : currentRelativeScrollPosition;
        const nextZoom = EditorModel.image.width / EditorModel.defaultRenderImageRect.width
        ViewPortActions.setZoom(nextZoom);
        ViewPortActions.resizeViewPortContent();
        ViewPortActions.setScrollPosition(
            ViewPortActions.calculateAbsoluteScrollPosition(nextRelativeScrollPosition)
        );
        EditorActions.fullRender();
    }

    static setZoom(value) {
        const currentZoom = GeneralSelector.getZoom();
        const isNewValueValid = NumberUtil.isValueInRange(value, ViewPointSettings.MIN_ZOOM, ViewPointSettings.MAX_ZOOM);
        if (isNewValueValid && value !== currentZoom) {
            store.dispatch(updateZoom(value));
        }
    }
}
