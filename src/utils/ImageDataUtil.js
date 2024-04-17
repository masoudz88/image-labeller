import { v4 as uuidv4 } from 'uuid';
import {FileUtil} from './FileUtil';
import {ImageRepository} from '../logic/imageRepository/ImageRepository';

export class ImageDataUtil {
    static createImageDataFromFileData(fileData) {
        return {
            id: uuidv4(),
            fileData,
            loadStatus: false,
            labelRects: [],
            labelPoints: [],
            labelLines: [],
            labelPolygons: [],
            labelNameIds: [],
            isVisitedByYOLOObjectDetector: false,
            isVisitedBySSDObjectDetector: false,
            isVisitedByPoseDetector: false,
            isVisitedByRoboflowAPI: false
        };
    }

    static cleanAnnotations(item) {
        return {
            ...item,
            labelRects: [],
            labelPoints: [],
            labelLines: [],
            labelPolygons: [],
            labelNameIds: []
        }
    }

    static arrange(items, idArrangement) {
        return items.sort((a, b) => {
            return idArrangement.indexOf(a.id) - idArrangement.indexOf(b.id);
        });
    }

    static loadMissingImages(images) {
        return new Promise((resolve, reject) => {
            const missingImages = images.filter((i) => !i.loadStatus);
            const missingImagesFiles = missingImages.map((i) => i.fileData);
            FileUtil.loadImages(missingImagesFiles)
                .then((htmlImageElements) => {
                    ImageRepository.storeImages(missingImages.map((i) => i.id), htmlImageElements);
                    resolve()
                })
                .catch((error) => reject(error));
        });
    }
}
