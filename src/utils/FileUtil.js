
export class FileUtil {
    static loadImageBase64(fileData) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(fileData);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    }

    static loadImage(fileData) {
        return new Promise((resolve, reject) => {
            const url = URL.createObjectURL(fileData);
            const image = new Image();
            image.src = url;
            image.onload = () => resolve(image);
            image.onerror = reject;
        });
    }

    static loadImages(fileData) {
        return new Promise((resolve, reject) => {
            const promises = fileData.map((data) => FileUtil.loadImage(data));
            Promise
                .all(promises)
                .then((values) => resolve(values))
                .catch((error) => reject(error));
        });
    }

    static readFile(fileData) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = (event) => {
                resolve(event?.target?.result);
            };
            reader.onerror = reject;
            reader.readAsText(fileData);
        });
    }

    static readFiles(fileData) {
        return new Promise((resolve, reject) => {
            const promises = fileData.map((data) => FileUtil.readFile(data));
            Promise
                .all(promises)
                .then((values) => resolve(values))
                .catch((error) => reject(error));
        });
    }

    static extractFileExtension(name) {
        const parts = name.split('.');
        return parts.length > 1 ? parts[parts.length - 1] : null;
    }

    static extractFileName(name) {
        const splitPath = name.split('.');
        let fName = '';
        for (const idx of Array(splitPath.length - 1).keys()) {
            if (fName === '') fName += splitPath[idx];
            else fName += '.' + splitPath[idx];
        }
        return fName;
    }
}
