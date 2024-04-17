import {zip} from "lodash";

export class ImageRepository {
    static repository = {};

    static storeImage(id, image) {
        ImageRepository.repository[id] = image;
    }

    static storeImages(ids, images) {
        zip(ids, images).forEach((pair) => {
            ImageRepository.storeImage(...pair);
        })
    }

    static getById(uuid) {
        return ImageRepository.repository[uuid];
    }
}