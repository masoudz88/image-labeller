import {BaseRenderEngine} from './BaseRenderEngine';
import {EditorModel} from '../../staticModels/EditorModel';
import {ViewPortActions} from '../actions/ViewPortActions';
import {DrawUtil} from '../../utils/DrawUtil';
import {RenderEngineUtil} from '../../utils/RenderEngineUtil';
import {RenderEngineSettings} from '../../settings/RenderEngineSettings';
import {GeneralSelector} from '../../store/selectors/GeneralSelector';
import {ProjectType} from '../../data/enums/ProjectType';

export class PrimaryEditorRenderEngine extends BaseRenderEngine {

    constructor(canvas) {
        super(canvas);
    }

    // =================================================================================================================
    // EVENT HANDLERS
    // =================================================================================================================

    mouseMoveHandler(data) {}
    mouseDownHandler(data) {}
    mouseUpHandler(data) {}

    // =================================================================================================================
    // RENDERING
    // =================================================================================================================

    render(data) {
        this.drawImage(EditorModel.image, ViewPortActions.calculateViewPortContentImageRect());
        this.renderCrossHair(data);
    }

    renderCrossHair(data) {
        if (!this.shouldRenderCrossHair(data)) return;

        const mouse = RenderEngineUtil.setPointBetweenPixels(data.mousePositionOnViewPortContent);
        const drawLine = (startPoint, endPoint) => {
            DrawUtil.drawLine(
                this.canvas,
                startPoint,
                endPoint,
                RenderEngineSettings.CROSS_HAIR_LINE_COLOR,
                2
            )
        }
        drawLine(
            {x: mouse.x, y: 0},
            {x: mouse.x - 1, y: mouse.y - RenderEngineSettings.crossHairPadding}
        )
        drawLine(
            {x: mouse.x, y: mouse.y + RenderEngineSettings.crossHairPadding},
            {x: mouse.x - 1, y: data.viewPortContentSize.height}
        )
        drawLine(
            {x: 0, y: mouse.y},
            {x: mouse.x - RenderEngineSettings.crossHairPadding, y: mouse.y - 1}
        )
        drawLine(
            {x: mouse.x + RenderEngineSettings.crossHairPadding, y: mouse.y},
            {x: data.viewPortContentSize.width, y: mouse.y - 1}
        )
    }

    shouldRenderCrossHair(data) {
        const isCrossHairVisible = GeneralSelector.getCrossHairVisibleStatus();
        const isImageInDragMode = GeneralSelector.getImageDragModeStatus();
        const projectType = GeneralSelector.getProjectType();
        const activePopupType = GeneralSelector.getActivePopupType();
        const isMouseOverCanvas = RenderEngineUtil.isMouseOverCanvas(data);
        const isCustomCursorBlocked =  GeneralSelector.getPreventCustomCursorStatus();

        return [
            !!this.canvas,
            isCrossHairVisible,
            !isImageInDragMode,
            projectType !== ProjectType.IMAGE_RECOGNITION,
            !activePopupType,
            isMouseOverCanvas,
            !isCustomCursorBlocked
        ].every(Boolean);
    }

    drawImage(image, imageRect) {
        if (!!image && !!this.canvas) {
            const ctx = this.canvas.getContext('2d');
            ctx.drawImage(image, imageRect.x, imageRect.y, imageRect.width, imageRect.height);
        }
    }

    isInProgress() {
        return false;
    }
}
