import {v4 as uuidv4} from 'uuid';
import {NotificationType} from '../data/enums/NotificationType';

export class NotificationUtil {
    static createErrorNotification(content) {
        return {
            id: uuidv4(),
            type: NotificationType.ERROR,
            header: content.header,
            description: content.description
        };
    }

    static createMessageNotification(content) {
        return {
            id: uuidv4(),
            type: NotificationType.MESSAGE,
            header: content.header,
            description: content.description
        };
    }

    static createWarningNotification(content) {
        return {
            id: uuidv4(),
            type: NotificationType.WARNING,
            header: content.header,
            description: content.description
        };
    }
}
