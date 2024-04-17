import {LabelType} from "../../data/enums/LabelType";
import {EditorModel} from "../../staticModels/EditorModel";
import {RectRenderEngine} from "../render/RectRenderEngine";
import {PointRenderEngine} from "../render/PointRenderEngine";
import {PolygonRenderEngine} from "../render/PolygonRenderEngine";
import {RectUtil} from "../../utils/RectUtil";
import {CanvasUtil} from "../../utils/CanvasUtil";
import {DrawUtil} from "../../utils/DrawUtil";
import {PrimaryEditorRenderEngine} from "../render/PrimaryEditorRenderEngine";
import {ContextManager} from "../context/ContextManager";
import {PointUtil} from "../../utils/PointUtil";
import {ViewPortActions} from "./ViewPortActions";
import {ImageUtil} from "../../utils/ImageUtil";
import {GeneralSelector} from "../../store/selectors/GeneralSelector";
import {ViewPortHelper} from "../helpers/ViewPortHelper";
import {CustomCursorStyle} from "../../data/enums/CustomCursorStyle";
import {LineRenderEngine} from "../render/LineRenderEngine";

export class EditorActions {

    // =================================================================================================================
    // RENDER ENGINES
    // =================================================================================================================

    static mountSupportRenderingEngine(activeLabelType) {
        switch (activeLabelType) {
            case LabelType.RECT:
                EditorModel.supportRenderingEngine = new RectRenderEngine(EditorModel.canvas);
                break;
            case LabelType.POINT:
                EditorModel.supportRenderingEngine = new PointRenderEngine(EditorModel.canvas);
                break;
            case LabelType.LINE:
                EditorModel.supportRenderingEngine = new LineRenderEngine(EditorModel.canvas);
                break;
            case LabelType.POLYGON:
                EditorModel.supportRenderingEngine = new PolygonRenderEngine(EditorModel.canvas);
                break;
            default:
                EditorModel.supportRenderingEngine = null;
                break;
        }
    };

    static swapSupportRenderingEngine(activeLabelType) {
        EditorActions.mountSupportRenderingEngine(activeLabelType);
    };

    static mountRenderEnginesAndHelpers(activeLabelType) {
        EditorModel.viewPortHelper = new ViewPortHelper();
        EditorModel.primaryRenderingEngine = new PrimaryEditorRenderEngine(EditorModel.canvas);
        EditorActions.mountSupportRenderingEngine(activeLabelType);
    }

    // =================================================================================================================
    // RENDER
    // =================================================================================================================

    static fullRender() {
        DrawUtil.clearCanvas(EditorModel.canvas);
        EditorModel.primaryRenderingEngine.render(EditorActions.getEditorData());
        EditorModel.supportRenderingEngine && EditorModel.supportRenderingEngine.render(EditorActions.getEditorData());
    }

    // =================================================================================================================
    // SETTERS
    // =================================================================================================================

    static setLoadingStatus(status) {
        EditorModel.isLoading = status;
    }
    static setActiveImage(image) {
        EditorModel.image = image;
    }

    static setViewPortActionsDisabledStatus(status) {
        EditorModel.viewPortActionsDisabled = status;
    }

    // =================================================================================================================
    // GETTERS
    // =================================================================================================================

    static getEditorData(event) {
        return {
            mousePositionOnViewPortContent: EditorModel.mousePositionOnViewPortContent,
            viewPortContentSize: CanvasUtil.getSize(EditorModel.canvas),
            activeKeyCombo: ContextManager.getActiveCombo(),
            event: event,
            zoom: GeneralSelector.getZoom(),
            viewPortSize: EditorModel.viewPortSize,
            defaultRenderImageRect: EditorModel.defaultRenderImageRect,
            viewPortContentImageRect: ViewPortActions.calculateViewPortContentImageRect(),
            realImageSize: ImageUtil.getSize(EditorModel.image),
            absoluteViewPortContentScrollPosition: ViewPortActions.getAbsoluteScrollPosition()
        };
    }

    // =================================================================================================================
    // HELPERS
    // =================================================================================================================

    static updateMousePositionIndicator(event) {
        if (!EditorModel.image || !EditorModel.canvas) {
            EditorModel.mousePositionIndicator.style.display = "none";
            EditorModel.cursor.style.display = "none";
            return;
        }

        const mousePositionOverViewPortContent = CanvasUtil.getMousePositionOnCanvasFromEvent(event, EditorModel.canvas);
        const viewPortContentScrollPosition = ViewPortActions.getAbsoluteScrollPosition();
        const viewPortContentImageRect = ViewPortActions.calculateViewPortContentImageRect();
        const mousePositionOverViewPort = PointUtil.subtract(mousePositionOverViewPortContent, viewPortContentScrollPosition);
        const isMouseOverImage = RectUtil.isPointInside(viewPortContentImageRect, mousePositionOverViewPortContent);
        const isMouseOverViewPort = RectUtil.isPointInside({x: 0, y: 0, ...EditorModel.viewPortSize}, mousePositionOverViewPort);

        if (isMouseOverViewPort && !GeneralSelector.getPreventCustomCursorStatus()) {
            EditorModel.cursor.style.left = mousePositionOverViewPort.x + "px";
            EditorModel.cursor.style.top = mousePositionOverViewPort.y + "px";
            EditorModel.cursor.style.display = "block";

            if (isMouseOverImage && ![CustomCursorStyle.GRAB, CustomCursorStyle.GRABBING].includes(GeneralSelector.getCustomCursorStyle())) {
                const imageSize = ImageUtil.getSize(EditorModel.image);
                const scale = imageSize.width / viewPortContentImageRect.width;
                const mousePositionOverImage = PointUtil.multiply(
                    PointUtil.subtract(mousePositionOverViewPortContent, viewPortContentImageRect),
                    scale
                );
                const text = "x: " + Math.round(mousePositionOverImage.x) + ", y: " + Math.round(mousePositionOverImage.y);

                EditorModel.mousePositionIndicator.innerHTML = text;
                EditorModel.mousePositionIndicator.style.left = (mousePositionOverViewPort.x + 15) + "px";
                EditorModel.mousePositionIndicator.style.top = (mousePositionOverViewPort.y + 15) + "px";
                EditorModel.mousePositionIndicator.style.display = "block";
            } else {
                EditorModel.mousePositionIndicator.style.display = "none";
            }
        } else {
            EditorModel.cursor.style.display = "none";
            EditorModel.mousePositionIndicator.style.display = "none";
        }
    };
}