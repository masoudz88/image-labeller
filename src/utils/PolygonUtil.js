export class PolygonUtil {
    static getEdges(vertices, closed = true) {
        const points = closed ? vertices.concat(vertices[0]) : vertices;
        const lines = [];
        for (let i = 0; i < points.length - 1; i++) {
            lines.push({start: points[i], end: points[i + 1]})
        }
        return lines;
    }
}
