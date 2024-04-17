import {Action} from '../Actions';

export function submitNewNotification(notification) {
    return {
        type: Action.SUBMIT_NEW_NOTIFICATION,
        payload: {
            notification,
        },
    };
}


export function deleteNotificationById(id) {
    return {
        type: Action.DELETE_NOTIFICATION_BY_ID,
        payload: {
            id,
        },
    };
}
