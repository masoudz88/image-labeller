export class SizeUtil {
    static scale(size, scale) {
        return {
            width: size.width * scale,
            height: size.height * scale
        }
    }
}