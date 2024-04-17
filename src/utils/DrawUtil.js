
import {UnitUtil} from './UnitUtil';

export class DrawUtil {

    static clearCanvas(canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    static drawLine(canvas, startPoint, endPoint, color = '#111111', thickness = 1) {
        const ctx = canvas.getContext('2d');
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = thickness;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(endPoint.x + 1, endPoint.y + 1);
        ctx.stroke();
        ctx.restore();
    }

    static drawRect(canvas, rect, color = '#fff', thickness = 1) {
        const ctx = canvas.getContext('2d');
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = thickness;
        ctx.beginPath();
        ctx.rect(rect.x, rect.y, rect.width, rect.height);
        ctx.stroke();
        ctx.restore();
    }

    static drawRectWithFill(canvas, rect, color = '#fff') {
        const ctx = canvas.getContext('2d');
        ctx.save();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.rect(rect.x, rect.y, rect.width, rect.height);
        ctx.fill();
        ctx.restore();
    }

    static shadeEverythingButRect(canvas, rect, color = 'rgba(0, 0, 0, 0.7)') {
        const ctx = canvas.getContext('2d');
        ctx.save();
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
        ctx.restore();
    }

    static drawCircleWithFill(canvas, anchorPoint, radius, color = '#ffffff') {
        const ctx = canvas.getContext('2d');
        ctx.save();
        const startAngleRad = UnitUtil.deg2rad(0);
        const endAngleRad = UnitUtil.deg2rad(360);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(anchorPoint.x, anchorPoint.y, radius, startAngleRad, endAngleRad, false);
        ctx.fill();
        ctx.restore();
    }

    static drawCircle(
        canvas,
        anchorPoint,
        radius,
        startAngleDeg,
        endAngleDeg,
        thickness = 20,
        color = '#ffffff'
    ) {
        const ctx = canvas.getContext('2d');
        const startAngleRad = UnitUtil.deg2rad(startAngleDeg);
        const endAngleRad = UnitUtil.deg2rad(endAngleDeg);
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = thickness;
        ctx.beginPath();
        ctx.arc(anchorPoint.x, anchorPoint.y, radius, startAngleRad, endAngleRad, false);
        ctx.stroke();
        ctx.restore();
    }

    static drawPolygon(canvas, anchors, color = '#fff', thickness = 1) {
        const ctx = canvas.getContext('2d');
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = thickness;
        ctx.beginPath();
        ctx.moveTo(anchors[0].x, anchors[0].y);
        for (let i = 1; i < anchors.length; i ++) {
            ctx.lineTo(anchors[i].x, anchors[i].y);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    }

    static drawPolygonWithFill(canvas, anchors, color = '#fff') {
        const ctx = canvas.getContext('2d');
        ctx.save();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(anchors[0].x, anchors[0].y);
        for (let i = 1; i < anchors.length; i ++) {
            ctx.lineTo(anchors[i].x, anchors[i].y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    static drawText(
        canvas,
        text,
        textSize,
        anchorPoint,
        color = '#ffffff',
        bold = false,
        align = 'center'
    ) {
        const ctx = canvas.getContext('2d');
        ctx.save();
        ctx.fillStyle = color;
        ctx.textAlign = align;
        ctx.textBaseline='middle';
        ctx.font = (bold ? 'bold ' : '') + textSize + 'px Arial';
        ctx.fillText(text, anchorPoint.x, anchorPoint.y);
        ctx.restore();
    }

    static hexToRGB(hex, alpha = null) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);

        if (alpha !== null) {
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        } else {
            return `rgb(${r}, ${g}, ${b})`;
        }
    }
}
