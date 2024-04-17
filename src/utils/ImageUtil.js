export class ImageUtil {
    static getSize(image) {
        if (!image) return null;
        return {
            width: image.width,
            height: image.height
        }
    }
}