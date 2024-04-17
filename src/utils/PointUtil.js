export class PointUtil {
    static equals(p1, p2) {
        return p1.x === p2.x && p1.y === p2.y;
    }

    static add(p1, p2) {
        return {
            x: p1.x + p2.x,
            y: p1.y + p2.y
        }
    }

    static subtract(p1, p2) {
        return {
            x: p1.x - p2.x,
            y: p1.y - p2.y
        }
    }

    static multiply(p1, factor) {
        return {
            x: p1.x * factor,
            y: p1.y * factor
        }
    }
}