import {Action} from '../Actions';

const initialState = {
    queue: []
}

export function notificationsReducer(state = initialState, action) {
    switch (action.type) {
        case Action.SUBMIT_NEW_NOTIFICATION: {
            if (state.queue.length > 0 && state.queue.at(-1).type === action.payload.notification.type) {
                return state;
            } else {
                return {
                    ...state,
                    queue: [...state.queue, action.payload.notification]
                }
            }
        }
        case Action.DELETE_NOTIFICATION_BY_ID: {
            return {
                ...state,
                queue: state.queue
                    .filter((message) => message.id !== action.payload.id)
            };
        }
        default:
            return state;
    }
}
