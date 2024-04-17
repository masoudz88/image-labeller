import {RectUtil} from './RectUtil';
import {store} from '../index';
import {CustomCursorStyle} from '../data/enums/CustomCursorStyle';
import {updateCustomCursorStyle} from '../store/general/actionCreators';
import {PointUtil} from './PointUtil';
import {LineUtil} from './LineUtil';
import {PolygonUtil} from './PolygonUtil';

export class RenderEngineUtil {
    static calculateImageScale(data) {
        return data.realImageSize.width / data.viewPortContentImageRect.width;
    }

    static isMouseOverImage(data) {
        return RectUtil.isPointInside(data.viewPortContentImageRect, data.mousePositionOnViewPortContent);
    }

    static isMouseOverCanvas(data) {
        return RectUtil.isPointInside(
            {x: 0, y: 0, ...data.viewPortContentSize},
            data.mousePositionOnViewPortContent
        );
    }

    static transferPointFromImageToViewPortContent(point, data) {
        const scale = RenderEngineUtil.calculateImageScale(data);
        return PointUtil.add(PointUtil.multiply(point, 1/scale), data.viewPortContentImageRect);
    }

    static transferPolygonFromImageToViewPortContent(polygon, data) {
        return polygon.map(
            (point) => RenderEngineUtil.transferPointFromImageToViewPortContent(point, data)
        );
    }

    static transferLineFromImageToViewPortContent(line, data) {
        return {
            start: RenderEngineUtil.transferPointFromImageToViewPortContent(line.start, data),
            end: RenderEngineUtil.transferPointFromImageToViewPortContent(line.end, data)
        };
    }

    static transferPointFromViewPortContentToImage(point, data) {
        const scale = RenderEngineUtil.calculateImageScale(data);
        return PointUtil.multiply(PointUtil.subtract(point, data.viewPortContentImageRect), scale);
    }

    static transferPolygonFromViewPortContentToImage(polygon, data) {
        return polygon.map(
            (point) => RenderEngineUtil.transferPointFromViewPortContentToImage(point, data)
        );
    }

    static transferLineFromViewPortContentToImage(line, data) {
        return {
            start: RenderEngineUtil.transferPointFromViewPortContentToImage(line.start, data),
            end: RenderEngineUtil.transferPointFromViewPortContentToImage(line.end, data)
        };
    }

    static transferRectFromViewPortContentToImage(rect, data) {
        const scale = RenderEngineUtil.calculateImageScale(data);
        return RectUtil.translate(RectUtil.scaleRect(rect, 1/scale), data.viewPortContentImageRect);
    }

    static transferRectFromImageToViewPortContent(rect, data) {
        const scale = RenderEngineUtil.calculateImageScale(data);
        const translation = {
            x: - data.viewPortContentImageRect.x,
            y: - data.viewPortContentImageRect.y
        };

        return RectUtil.scaleRect(RectUtil.translate(rect, translation), scale);
    }

    static wrapDefaultCursorStyleInCancel(data) {
        if (RectUtil.isPointInside(data.viewPortContentImageRect, data.mousePositionOnViewPortContent)) {
            store.dispatch(updateCustomCursorStyle(CustomCursorStyle.DEFAULT));
        } else {
            store.dispatch(updateCustomCursorStyle(CustomCursorStyle.CANCEL));
        }
    }

    static setValueBetweenPixels(value) {
        return Math.floor(value) + 0.5;
    }

    static setPointBetweenPixels(point) {
        return {
            x: RenderEngineUtil.setValueBetweenPixels(point.x),
            y: RenderEngineUtil.setValueBetweenPixels(point.y)
        };
    }

    static setRectBetweenPixels(rect) {
        const topLeft = {
            x: rect.x,
            y: rect.y
        };
        const bottomRight = {
            x: rect.x + rect.width,
            y: rect.y + rect.height
        };
        const topLeftBetweenPixels = RenderEngineUtil.setPointBetweenPixels(topLeft);
        const bottomRightBetweenPixels = RenderEngineUtil.setPointBetweenPixels(bottomRight);
        return {
            x: topLeftBetweenPixels.x,
            y: topLeftBetweenPixels.y,
            width: bottomRightBetweenPixels.x - topLeftBetweenPixels.x,
            height: bottomRightBetweenPixels.y - topLeftBetweenPixels.y
        }
    }

    static isMouseOverLine(mouse, line, radius) {
        const minX = Math.min(line.start.x, line.end.x);
        const maxX = Math.max(line.start.x, line.end.x);
        const minY = Math.min(line.start.y, line.end.y);
        const maxY = Math.max(line.start.y, line.end.y);

        return (minX - radius <= mouse.x && maxX + radius >= mouse.x) &&
            (minY - radius <= mouse.y && maxY + radius >= mouse.y) &&
            LineUtil.getDistanceFromLine(line, mouse) < radius;
    }

    static isMouseOverAnchor(mouse, anchor, radius) {
        const anchorSize = { width: 2 * radius, height: 2 * radius}
        return RectUtil.isPointInside(RectUtil.getRectWithCenterAndSize(anchor, anchorSize), mouse);
    }

    static isMouseOverPolygon(mouse, vertices, radius) {
        for (const vertex of vertices) {
            if (RenderEngineUtil.isMouseOverAnchor(mouse, vertex, radius)) return true;
        }
        const edges = PolygonUtil.getEdges(vertices)
        for (const edge of edges) {
            if (RenderEngineUtil.isMouseOverLine(mouse, edge, radius)) return true;
        }
        return false;
    }
}
