import React, {useState} from 'react';
import './NotificationsView.scss';
import {connect} from 'react-redux';
import classNames from 'classnames';
import {deleteNotificationById} from '../../store/notifications/actionCreators';
import {NotificationType} from '../../data/enums/NotificationType';

var NotificationState;

(function(NotificationState) {
    NotificationState["IN"] = "IN";
    NotificationState["DISPLAY"] = "DISPLAY";
    NotificationState["OUT"] = "OUT";
    NotificationState["IDLE"] = "IDLE";
})(NotificationState || (NotificationState = {}));

var Animation;

(function(Animation) {
    Animation["IN"] = "animation-in";
    Animation["DISPLAY"] = "animation-display";
    Animation["OUT"] = "animation-out";
})(Animation || (Animation = {}));

const NotificationsView = (props) => {
    const [ notificationState, setNotificationState ] = useState(NotificationState.IDLE);

    if (props.queue.length > 0 && notificationState === NotificationState.IDLE) {
        setNotificationState(NotificationState.IN)
    }

    const notification = props.queue[0]

    const onClose = () => {
        setNotificationState(NotificationState.OUT)
    }

    const onAnimationEnd = (event) => {
        switch (event.animationName) {
            case Animation.IN:
                setNotificationState(NotificationState.DISPLAY)
                break
            case Animation.DISPLAY:
                setNotificationState(NotificationState.OUT)
                break
            case Animation.OUT:
                props.deleteNotificationByIdAction(notification.id)
                setNotificationState(NotificationState.IDLE)
                break
        }
    }

    const getNotificationWrapperClassName = () => {
        return classNames('notification-wrapper', {
            'in': notificationState === NotificationState.IN,
            'display': notificationState === NotificationState.DISPLAY,
            'out': notificationState === NotificationState.OUT
        });
    }

    const getNotificationClassName = () => {
        return classNames('notification', {
            'error': notification.type === NotificationType.ERROR,
            'success': notification.type === NotificationType.SUCCESS,
            'message': notification.type === NotificationType.MESSAGE,
            'warning': notification.type === NotificationType.WARNING
        });
    }

    const renderNotification = () => {
        return notification && <div
            className={getNotificationWrapperClassName()}
            key={notification.id}
            onAnimationEnd={onAnimationEnd}
            onClick={onClose}>
            <div className={getNotificationClassName()}>
                <div className='header'>
                    {notification.header}
                </div>
                <div className='content'>
                    {notification.description}
                </div>
                <div className='loader' />
            </div>
        </div>;
    }

    return notificationState !== NotificationState.IDLE ? renderNotification() : null;
}

const mapDispatchToProps = {
    deleteNotificationByIdAction: deleteNotificationById
};

const mapStateToProps = (state) => ({
    queue: state.notifications.queue
});

export default connect(mapStateToProps, mapDispatchToProps)(NotificationsView);
