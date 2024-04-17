import {MouseEventUtil} from "../../utils/MouseEventUtil";
import {EventType} from "../../data/enums/EventType";
import {store} from "../../index";
import {updateCustomCursorStyle} from "../../store/general/actionCreators";
import {CustomCursorStyle} from "../../data/enums/CustomCursorStyle";
import {EditorModel} from "../../staticModels/EditorModel";
import {PointUtil} from "../../utils/PointUtil";
import {ViewPortActions} from "../actions/ViewPortActions";

export class ViewPortHelper {
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
        const event = data.event;
        this.startScrollPosition = data.absoluteViewPortContentScrollPosition;
        this.mouseStartPosition = {x: event.screenX, y: event.screenY};

        store.dispatch(updateCustomCursorStyle(CustomCursorStyle.GRABBING));
        EditorModel.canvas.style.cursor = "none";
    }

    mouseUpHandler(data) {
        this.startScrollPosition = null;
        this.mouseStartPosition = null;
        store.dispatch(updateCustomCursorStyle(CustomCursorStyle.GRAB));
        EditorModel.canvas.style.cursor = "none";
    }

    mouseMoveHandler(data) {
        if (!!this.startScrollPosition && !!this.mouseStartPosition) {
            const event = data.event;
            const currentMousePosition = {x: event.screenX, y: event.screenY};
            const mousePositionDelta = PointUtil.subtract(currentMousePosition, this.mouseStartPosition);
            const nextScrollPosition = PointUtil.subtract(this.startScrollPosition, mousePositionDelta);
            ViewPortActions.setScrollPosition(nextScrollPosition);
            store.dispatch(updateCustomCursorStyle(CustomCursorStyle.GRABBING));
        } else {
            store.dispatch(updateCustomCursorStyle(CustomCursorStyle.GRAB));
        }
        EditorModel.canvas.style.cursor = "none";
    }
}