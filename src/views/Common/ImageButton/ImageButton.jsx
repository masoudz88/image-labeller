import * as React from 'react';
import './ImageButton.scss';
import classNames from "classnames";

export const ImageButton = React.forwardRef((props, ref) => {
    const {buttonSize, padding, image, imageAlt, href, onClick, style, isActive, isDisabled, externalClassName} = props;
    const imagePadding = !!padding ? padding : 10;

    const onClickHandler = (event) => {
        event.stopPropagation();
        !!onClick && onClick();
    };

    const buttonStyle = {
        ...style,
        width: buttonSize.width,
        height: buttonSize.height
    };

    const imageStyle = {
        maxWidth: buttonSize.width - imagePadding,
        maxHeight: buttonSize.height - imagePadding
    };

    const getClassName = () => {
        return classNames("ImageButton", externalClassName, {
            "active": isActive,
            "disabled": isDisabled,
        });
    };
    
    return (
        <div
            className={getClassName()}
            style={buttonStyle}
            onClick={onClickHandler}
            ref={ref}>
            {!!href && <a href={href} style={imageStyle} target="_blank" rel="noopener noreferrer">
                <img draggable={false} alt={imageAlt} src={image} style={imageStyle} />
            </a>}
            {!href && <img draggable={false} alt={imageAlt} src={image} style={imageStyle} />}
        </div>
    );
});
