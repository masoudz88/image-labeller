export let EventType;

(function(EventType) {
    EventType["RESIZE"] = "resize";
    EventType["MOUSE_UP"] = "mouseup";
    EventType["MOUSE_DOWN"] = "mousedown";
    EventType["MOUSE_MOVE"] = "mousemove";
    EventType["MOUSE_WHEEL"] = "wheel";
    EventType["KEY_DOWN"] = "keydown";
    EventType["KEY_PRESS"] = "keypress";
    EventType["KEY_UP"] = "keyup";
    EventType["FOCUS"] = "focus";
})(EventType || (EventType = {}));