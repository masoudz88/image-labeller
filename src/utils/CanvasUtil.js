export class CanvasUtil {
    static getMousePositionOnCanvasFromEvent(event, canvas) {
        if (!!canvas && !!event) {
            const canvasRect = canvas.getBoundingClientRect();
            return {
                x: event.clientX - canvasRect.left,
                y: event.clientY - canvasRect.top
            }
        }
        return null;
    }

    static getClientRect(canvas) {
        if (canvas) {
            const canvasRect = canvas.getBoundingClientRect();
            return {
                x: canvasRect.left,
                y: canvasRect.top,
                width: canvasRect.width,
                height: canvasRect.height
            }
        }
        return null;
    }

    static getSize(canvas) {
        if (canvas) {
            const canvasRect = canvas.getBoundingClientRect();
            return {
                width: canvasRect.width,
                height: canvasRect.height
            }
        }
        return null;
    }
}