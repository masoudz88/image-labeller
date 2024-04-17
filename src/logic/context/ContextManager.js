import {ContextType} from "../../data/enums/ContextType";
import {store} from "../../index";
import {updateActiveContext} from "../../store/general/actionCreators";
import {xor, isEmpty} from "lodash";
import {EditorContext} from "./EditorContext";
import {PopupContext} from "./PopupContext";
import {GeneralSelector} from "../../store/selectors/GeneralSelector";
import {EventType} from "../../data/enums/EventType";

export class ContextManager {
    static activeCombo = [];
    static actions = [];
    static contextHistory = [];

    static getActiveCombo() {
        return ContextManager.activeCombo;
    }

    static init() {
        window.addEventListener(EventType.KEY_DOWN, ContextManager.onDown);
        window.addEventListener(EventType.KEY_UP, ContextManager.onUp);
        window.addEventListener(EventType.FOCUS, ContextManager.onFocus);
    }

    static switchCtx(context) {
        const activeCtx = GeneralSelector.getActiveContext();

        if (activeCtx !== context) {
            ContextManager.contextHistory.push(activeCtx);
            ContextManager.updateCtx(context);
        }
    }

    static updateCtx(context) {
        store.dispatch(updateActiveContext(context));
        switch (context) {
            case ContextType.EDITOR:
                ContextManager.actions = EditorContext.getActions();
                break;
            case ContextType.POPUP:
                ContextManager.actions = PopupContext.getActions();
                break;
            default:
                ContextManager.actions = [];
        }
    }

    static restoreCtx() {
        ContextManager.updateCtx(ContextManager.contextHistory.pop());
    }

    static onDown(event) {
        const keyCode = ContextManager.getKeyCodeFromEvent(event);
        if (!ContextManager.isInCombo(keyCode)) {
            ContextManager.addToCombo(keyCode);
        }
        ContextManager.execute(event);
    }

    static onUp(event) {
        const keyCode = ContextManager.getKeyCodeFromEvent(event);
        ContextManager.removeFromCombo(keyCode);
    }

    static onFocus() {
        ContextManager.activeCombo = [];
    }

    static execute(event) {
        for (let i = 0; i < ContextManager.actions.length; i++) {
            const hotKey = ContextManager.actions[i];
            if (ContextManager.matchCombo(ContextManager.activeCombo, hotKey.keyCombo)) {
                hotKey.action(event);
            }
        }
    }

    static isInCombo(keyCode) {
        return ContextManager.activeCombo.indexOf(keyCode) >= 0;
    }

    static addToCombo(keyCode) {
        ContextManager.activeCombo.push(keyCode);
    }

    static removeFromCombo(keyCode) {
        const index = ContextManager.activeCombo.indexOf(keyCode);
        if (index >= 0) {
            ContextManager.activeCombo.splice(index, 1);
        }
    }

    static getKeyCodeFromEvent(event) {
        return event.key;
    }

    static matchCombo(combo1, combo2) {
        return isEmpty(xor(combo1, combo2));
    }
}