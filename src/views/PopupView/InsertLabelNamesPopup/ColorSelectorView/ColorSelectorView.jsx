import React from 'react';
import './ColorSelectorView.scss'

export const ColorSelectorView = ({color, onClick}) => {
    return (
        <div
            className={'ColorSelectorView'}
            style={{
                backgroundColor: color
            }}
            onClick={onClick}>
            <img draggable={false} alt={'refresh'} src={'ico/refresh.png'} />
        </div>
    );
}
