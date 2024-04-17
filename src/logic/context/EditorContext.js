import {EditorModel} from "../../staticModels/EditorModel";
import {LabelType} from "../../data/enums/LabelType";
import {EditorActions} from "../actions/EditorActions";
import {BaseContext} from "./BaseContext";
import {ImageActions} from "../actions/ImageActions";
import {ViewPortActions} from "../actions/ViewPortActions";
import {Direction} from "../../data/enums/Direction";
import {PlatformUtil} from "../../utils/PlatformUtil";
import {LabelActions} from "../actions/LabelActions";

export class EditorContext extends BaseContext {
    static actions = [
        {
            keyCombo: ["Enter"],
            action: (event) => {
                if (EditorModel.supportRenderingEngine && EditorModel.supportRenderingEngine.labelType === LabelType.POLYGON) {
                    const editorData = EditorActions.getEditorData();
                    (EditorModel.supportRenderingEngine).addLabelAndFinishCreation(editorData);
                }
                EditorActions.fullRender();
            }
        },
        {
            keyCombo: ["Escape"],
            action: (event) => {
                if (EditorModel.supportRenderingEngine) {
                    switch (EditorModel.supportRenderingEngine.labelType) {
                        case LabelType.POLYGON:
                            (EditorModel.supportRenderingEngine).cancelLabelCreation();
                            break;
                        case LabelType.LINE:
                            (EditorModel.supportRenderingEngine).cancelLabelCreation();
                            break;
                    }
                }
                EditorActions.fullRender();
            }
        },
        {
            keyCombo: PlatformUtil.isMac(window.navigator.userAgent) ? ["Alt", "ArrowLeft"] : ["Control", "ArrowLeft"],
            action: (event) => {
                ImageActions.getPreviousImage()
            }
        },
        {
            keyCombo: PlatformUtil.isMac(window.navigator.userAgent) ? ["Alt", "ArrowRight"] : ["Control", "ArrowRight"],
            action: (event) => {
                ImageActions.getNextImage();
            }
        },
        {
            keyCombo: PlatformUtil.isMac(window.navigator.userAgent) ? ["Alt", "+"] : ["Control", "+"],
            action: (event) => {
                ViewPortActions.zoomIn();
            }
        },
        {
            keyCombo: PlatformUtil.isMac(window.navigator.userAgent) ? ["Alt", "-"] : ["Control", "-"],
            action: (event) => {
                ViewPortActions.zoomOut();
            }
        },
        {
            keyCombo: ["ArrowRight"],
            action: (event) => {
                event.preventDefault();
                ViewPortActions.translateViewPortPosition(Direction.RIGHT);
            }
        },
        {
            keyCombo: ["ArrowLeft"],
            action: (event) => {
                event.preventDefault();
                ViewPortActions.translateViewPortPosition(Direction.LEFT);
            }
        },
        {
            keyCombo: ["ArrowUp"],
            action: (event) => {
                event.preventDefault();
                ViewPortActions.translateViewPortPosition(Direction.BOTTOM);
            }
        },
        {
            keyCombo: ["ArrowDown"],
            action: (event) => {
                event.preventDefault();
                ViewPortActions.translateViewPortPosition(Direction.TOP);
            }
        },
        {
            keyCombo: PlatformUtil.isMac(window.navigator.userAgent) ? ["Backspace"] : ["Delete"],
            action: (event) => {
                LabelActions.deleteActiveLabel();
            }
        },
        {
            keyCombo: PlatformUtil.isMac(window.navigator.userAgent) ? ["Alt", "0"] : ["Control", "0"],
            action: (event) => {
                ImageActions.setActiveLabelOnActiveImage(0);
                EditorActions.fullRender();
            }
        },
        {
            keyCombo: PlatformUtil.isMac(window.navigator.userAgent) ? ["Alt", "1"] : ["Control", "1"],
            action: (event) => {
                ImageActions.setActiveLabelOnActiveImage(1);
                EditorActions.fullRender();
            }
        },
        {
            keyCombo: PlatformUtil.isMac(window.navigator.userAgent) ? ["Alt", "2"] : ["Control", "2"],
            action: (event) => {
                ImageActions.setActiveLabelOnActiveImage(2);
                EditorActions.fullRender();
            }
        },
        {
            keyCombo: PlatformUtil.isMac(window.navigator.userAgent) ? ["Alt", "3"] : ["Control", "3"],
            action: (event) => {
                ImageActions.setActiveLabelOnActiveImage(3);
                EditorActions.fullRender();
            }
        },
        {
            keyCombo: PlatformUtil.isMac(window.navigator.userAgent) ? ["Alt", "4"] : ["Control", "4"],
            action: (event) => {
                ImageActions.setActiveLabelOnActiveImage(4);
                EditorActions.fullRender();
            }
        },
        {
            keyCombo: PlatformUtil.isMac(window.navigator.userAgent) ? ["Alt", "5"] : ["Control", "5"],
            action: (event) => {
                ImageActions.setActiveLabelOnActiveImage(5);
                EditorActions.fullRender();
            }
        },
        {
            keyCombo: PlatformUtil.isMac(window.navigator.userAgent) ? ["Alt", "6"] : ["Control", "6"],
            action: (event) => {
                ImageActions.setActiveLabelOnActiveImage(6);
                EditorActions.fullRender();
            }
        },
        {
            keyCombo: PlatformUtil.isMac(window.navigator.userAgent) ? ["Alt", "7"] : ["Control", "7"],
            action: (event) => {
                ImageActions.setActiveLabelOnActiveImage(7);
                EditorActions.fullRender();
            }
        },
        {
            keyCombo: PlatformUtil.isMac(window.navigator.userAgent) ? ["Alt", "8"] : ["Control", "8"],
            action: (event) => {
                ImageActions.setActiveLabelOnActiveImage(8);
                EditorActions.fullRender();
            }
        },
        {
            keyCombo: PlatformUtil.isMac(window.navigator.userAgent) ? ["Alt", "9"] : ["Control", "9"],
            action: (event) => {
                ImageActions.setActiveLabelOnActiveImage(9);
                EditorActions.fullRender();
            }
        }
    ];
}