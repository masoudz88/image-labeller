import * as React from 'react';
import './TextButton.scss';
import classNames from 'classnames';

export const TextButton = (props) => {
    const { key, label, onClick, style, isActive, isDisabled, externalClassName} = props;

    const getClassName = () => {
        return classNames('TextButton', externalClassName, {
            'active': isActive,
            'disabled': isDisabled
        });
    };

    const onClickHandler = (event) => {
        event.stopPropagation();
        if (onClick) {
            onClick();
        }
    };

    return (
        <div
            className={getClassName()}
            onClick={onClickHandler}
            key={key}
            style={style}>
            {label}
        </div>
    );
};
