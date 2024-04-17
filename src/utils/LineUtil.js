export class LineUtil {
    static getDistanceFromLine(l, p) {
        if (l.start.x !== l.end.x || l.start.y !== l.end.y) {
            const nom = Math.abs(
                (l.end.y - l.start.y) * p.x - (l.end.x - l.start.x) * p.y + l.end.x * l.start.y - l.end.y * l.start.x
            );
            const denom = Math.sqrt(Math.pow(l.end.y - l.start.y, 2) + Math.pow(l.end.x - l.start.x, 2));
            return nom / denom;
        }
        return null;
    }

    static getCenter(l) {
        return {
            x: (l.start.x + l.end.x) / 2,
            y: (l.start.y + l.end.y) / 2
        }
    }

    static getPoints(l) {
        return [l.start, l.end]
    }
}