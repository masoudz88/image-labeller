import {chunk} from "lodash";

export class COCOUtils {
    static bbox2rect(bbox) {
        return {
            x: bbox[0],
            y: bbox[1],
            width: bbox[2],
            height: bbox[3]
        }
    }

    static segmentation2vertices(segmentation) {
        return segmentation.map((segment) => {
            return chunk(segment, 2).map((pair) => {
                return {x: pair[0], y: pair[1]}
            });
        });
    }
}