import React from 'react';
import './GenericSideMenuPopup.scss'
import { GenericYesNoPopup } from '../GenericYesNoPopup/GenericYesNoPopup';

export const GenericSideMenuPopup = (
    {
        title,
        acceptLabel,
        onAccept,
        disableAcceptButton,
        rejectLabel,
        onReject,
        renderContent,
        renderSideMenuContent
    }
) => {

    const renderPopupContent = () => {
        return (
            <div className='generic-side-menu-popup'>
                <div className='left-container'>
                    {renderSideMenuContent()}
                </div>
                <div className='right-container'>
                    {renderContent()}
                </div>
            </div>
        );
    }

    return (
        <GenericYesNoPopup
            title={title}
            renderContent={renderPopupContent}
            acceptLabel={acceptLabel}
            disableAcceptButton={disableAcceptButton}
            onAccept={onAccept}
            rejectLabel={rejectLabel}
            onReject={onReject} />
    );
}