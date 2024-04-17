import * as React from "react";
import classNames from "classnames";
import './VerticalEditorButton.scss';

export const VerticalEditorButton = (props) => {

    const { key, label, onClick, style, isActive, isDisabled, image, imageAlt} = props;

    const getClassName = () => {
        return classNames("VerticalEditorButton", {
            "active": isActive,
            "disabled": isDisabled
        });
    };

    return (
        <div
            className={getClassName()}
            onClick={!!onClick ? onClick : undefined}
            key={key}
            style={style}>
            {image && <img draggable={false} alt={imageAlt} src={image} />}
            {label}
        </div>
    );
};