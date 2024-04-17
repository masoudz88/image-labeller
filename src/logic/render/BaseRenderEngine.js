import {MouseEventUtil} from '../../utils/MouseEventUtil';
import {EventType} from '../../data/enums/EventType';
import {GeneralSelector} from '../../store/selectors/GeneralSelector';
import {RenderEngineSettings} from '../../settings/RenderEngineSettings';
import {LabelsSelector} from '../../store/selectors/LabelsSelector';

export class BaseRenderEngine {
    constructor(canvas) {
        this.canvas = canvas;
    }

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

    static resolveLabelLineColor(labelId, isActive) {
        const perClassColor = GeneralSelector.getEnablePerClassColorationStatus();
        if (perClassColor) {
            const labelName = LabelsSelector.getLabelNameById(labelId);
            return labelName ? labelName.color : RenderEngineSettings.DEFAULT_LINE_COLOR;
        } else {
            return isActive ? RenderEngineSettings.ACTIVE_LINE_COLOR : RenderEngineSettings.INACTIVE_LINE_COLOR;
        }
    }

    static resolveLabelAnchorColor(isActive) {
        const perClassColor = GeneralSelector.getEnablePerClassColorationStatus();
        if (perClassColor) {
            return RenderEngineSettings.DEFAULT_ANCHOR_COLOR;
        } else {
            return isActive ? RenderEngineSettings.ACTIVE_ANCHOR_COLOR : RenderEngineSettings.INACTIVE_ANCHOR_COLOR;
        }
    }
}
