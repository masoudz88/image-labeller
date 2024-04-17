import { v4 as uuidv4 } from 'uuid';
import {find} from 'lodash';
import {LabelStatus} from '../data/enums/LabelStatus';
import { sample } from 'lodash';
import {Settings} from '../settings/Settings';

export class LabelUtil {
    static createLabelName(name) {
        return {
            id: uuidv4(),
            name,
            color: sample(Settings.LABEL_COLORS_PALETTE)
        };
    }

    static createLabelRect(labelId, rect) {
        return {
            id: uuidv4(),
            labelId,
            rect,
            isVisible: true,
            isCreatedByAI: false,
            status: LabelStatus.ACCEPTED,
            suggestedLabel: null
        };
    }

    static createLabelPolygon(labelId, vertices) {
        return {
            id: uuidv4(),
            labelId,
            vertices,
            isVisible: true
        };
    }

    static createLabelPoint(labelId, point) {
        return {
            id: uuidv4(),
            labelId,
            point,
            isVisible: true,
            isCreatedByAI: false,
            status: LabelStatus.ACCEPTED,
            suggestedLabel: null
        };
    }

    static toggleAnnotationVisibility(annotation) {
        return {
            ...annotation,
            isVisible: !annotation.isVisible
        }
    }

    static labelNamesIdsDiff(oldLabelNames, newLabelNames) {
        return oldLabelNames.reduce((missingIds, labelName) => {
            if (!find(newLabelNames, { 'id': labelName.id })) {
                missingIds.push(labelName.id);
            }
            return missingIds
        }, []);
    }
}
