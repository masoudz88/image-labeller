import {NumberUtil} from './NumberUtil';
import {Direction} from '../data/enums/Direction';

export class RectUtil {
    static getRatio(rect) {
        if (!rect) return null;

        return rect.width/rect.height
    }

    static intersect(r1, r2) {
        if (!r1 || !r2) return null;
        return !(
            r2.x > r1.x + r1.width ||
            r2.x + r2.width < r1.x ||
            r2.y > r1.y + r1.height ||
            r2.y + r2.height < r1.y
        );
    }

    static isPointInside(rect, point) {
        if (!rect || !point) return null;
        return (
            rect.x <= point.x &&
            rect.x + rect.width >= point.x &&
            rect.y <= point.y &&
            rect.y + rect.height >= point.y
        )
    }

    static getRectWithCenterAndSize(centerPoint, size) {
        return {
            x: centerPoint.x - 0.5 * size.width,
            y: centerPoint.y - 0.5 * size.height,
            ...size
        }
    }

    static fitInsideRectWithRatio(containerRect, ratio) {
        const containerRectRatio = RectUtil.getRatio(containerRect);
        if (containerRectRatio < ratio) {
            const innerRectHeight = containerRect.width / ratio;
            return {
                x: containerRect.x,
                y: containerRect.y + (containerRect.height - innerRectHeight) / 2,
                width: containerRect.width,
                height: innerRectHeight
            }
        }
        else {
            const innerRectWidth = containerRect.height * ratio;
            return {
                x: containerRect.x + (containerRect.width - innerRectWidth) / 2,
                y: containerRect.y,
                width: innerRectWidth,
                height: containerRect.height
            }
        }
    }

    static resizeRect(inputRect, rectAnchor, delta) {
        const rect = {...inputRect};
        switch (rectAnchor) {
            case Direction.RIGHT:
                rect.width += delta.x;
                break;
            case Direction.BOTTOM_RIGHT:
                rect.width += delta.x;
                rect.height += delta.y;
                break;
            case Direction.BOTTOM:
                rect.height += delta.y;
                break;
            case Direction.TOP_RIGHT:
                rect.width += delta.x;
                rect.y += delta.y;
                rect.height -= delta.y;
                break;
            case Direction.TOP:
                rect.y += delta.y;
                rect.height -= delta.y;
                break;
            case Direction.TOP_LEFT:
                rect.x += delta.x;
                rect.width -= delta.x;
                rect.y += delta.y;
                rect.height -= delta.y;
                break;
            case Direction.LEFT:
                rect.x += delta.x;
                rect.width -= delta.x;
                break;
            case Direction.BOTTOM_LEFT:
                rect.x += delta.x;
                rect.width -= delta.x;
                rect.height += delta.y;
                break;
        }

        if (rect.width < 0) {
            rect.x = rect.x + rect.width;
            rect.width = -rect.width;
        }

        if (rect.height < 0) {
            rect.y = rect.y + rect.height;
            rect.height = -rect.height;
        }

        return rect;
    }

    static translate(rect, delta) {
        return {
            ...rect,
            x: rect.x + delta.x,
            y: rect.y + delta.y
        }
    }

    static expand(rect, delta) {
        return {
            x: rect.x - delta.x,
            y: rect.y - delta.y,
            width: rect.width + 2 * delta.x,
            height: rect.height + 2 * delta.y
        }
    }

    static scaleRect(rect, scale) {
        return {
            x: rect.x * scale,
            y: rect.y * scale,
            width: rect.width * scale,
            height: rect.height * scale
        }
    }

    static mapRectToAnchors(rect) {
        return [
            {type: Direction.TOP_LEFT, position: {x: rect.x, y: rect.y}},
            {type: Direction.TOP, position: {x: rect.x + 0.5 * rect.width, y: rect.y}},
            {type: Direction.TOP_RIGHT, position: {x: rect.x + rect.width, y: rect.y}},
            {type: Direction.LEFT, position: {x: rect.x, y: rect.y + 0.5 * rect.height}},
            {type: Direction.RIGHT, position: {x: rect.x + rect.width, y: rect.y + 0.5 * rect.height}},
            {type: Direction.BOTTOM_LEFT, position: {x: rect.x, y: rect.y + rect.height}},
            {type: Direction.BOTTOM, position: {x: rect.x + 0.5 * rect.width, y: rect.y + rect.height}},
            {type: Direction.BOTTOM_RIGHT, position: {x: rect.x + rect.width, y: rect.y + rect.height}}
        ]
    }

    static snapPointToRect(point, rect) {
        if (RectUtil.isPointInside(rect, point))
            return point;

        return {
            x: NumberUtil.snapValueToRange(point.x, rect.x, rect.x + rect.width),
            y: NumberUtil.snapValueToRange(point.y, rect.y, rect.y + rect.height)
        };
    }

    static getCenter(rect) {
        return {
            x: rect.x + rect.width / 2,
            y: rect.y + rect.height / 2
        }
    }

    static getSize(rect) {
        return {
            width: rect.width,
            height: rect.height
        }
    }

    static getVertices(rect) {
        return [
            { x: rect.x, y: rect.y },
            { x: rect.x + rect.width, y: rect.y },
            { x: rect.x + rect.width, y: rect.y + rect.height },
            { x: rect.x, y: rect.y + rect.height }
        ]
    }
}


