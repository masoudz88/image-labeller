export class ArrayUtilAmbiguousMatchError extends Error {
    constructor() {
        super('Given predicate results in more than one value being matched.');
        this.name = 'ArrayUtilAmbiguousMatchError';
    }
}

export class EmptyArrayError extends Error {
    constructor() {
        super('Given array is empty.');
        this.name = 'EmptyArrayError';
    }
}

export class NegativeIndexError extends Error {
    constructor() {
        super('Index can not be negative.');
        this.name = 'NegativeIndexError';
    }
}

export class ArrayUtil {
    static partition(array, predicate) {
        return array.reduce((acc, item) => {
            if (predicate(item))
                acc.pass.push(item)
            else
                acc.fail.push(item)
            return acc
        }, {pass: [], fail: []});
    }

    static match(array1, array2, predicate) {
        return array1.reduce((acc, key) => {
            const match = array2.filter((value) => predicate(key, value))
            if (match.length === 1) {
                acc.push([key, match[0]])
            } else if (match.length > 1) {
                throw new ArrayUtilAmbiguousMatchError()
            }
            return acc
        }, []);
    }

    static unzip(array) {
        return array.reduce((acc, i) => {
            acc[0].push(i[0]);
            acc[1].push(i[1]);
            return acc;
        }, [[], []]);
    }

    static getByInfiniteIndex(array, index) {
        if (array.length === 0) {
            throw new EmptyArrayError()
        }
        if (index < 0) {
            throw new NegativeIndexError()
        }
        const boundedIndex = index % array.length
        return array[boundedIndex]
    }
}
