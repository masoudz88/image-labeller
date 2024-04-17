export class NumberUtil {
    static snapValueToRange(value, min, max) {
        if (value < min)
            return min;
        if (value > max)
            return max;
        return value;
    }

    static isValueInRange(value, min, max) {
        return value >= min && value <= max;
    }
}
