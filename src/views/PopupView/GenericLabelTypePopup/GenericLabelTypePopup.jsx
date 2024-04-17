import React, {useState} from 'react'
import './GenericLabelTypePopup.scss'
import {connect} from 'react-redux';
import {ImageButton} from '../../Common/ImageButton/ImageButton';
import {GenericYesNoPopup} from '../GenericYesNoPopup/GenericYesNoPopup';
import { LabelToolkitData } from '../../../data/info/LabelToolkitData';

const GenericLabelTypePopup = (
    {
        title,
        activeLabelType,
        projectType,
        onLabelTypeChange,
        acceptLabel,
        onAccept,
        skipAcceptButton,
        disableAcceptButton,
        rejectLabel,
        onReject,
        renderInternalContent
    }) => {

    const [labelType, setLabelType] = useState(activeLabelType);

    const getSidebarButtons = () => {
        return LabelToolkitData
            .filter((label) => label.projectType === projectType)
            .map((label) => {
                return (
                    <ImageButton
                        key={label.labelType}
                        image={label.imageSrc}
                        imageAlt={label.imageAlt}
                        buttonSize={{width: 40, height: 40}}
                        padding={20}
                        onClick={() => {
                            setLabelType(label.labelType);
                            onLabelTypeChange(label.labelType);
                        }}
                        isActive={labelType === label.labelType} />
                );
            });
    }

    const renderContent = () => {
        return (
            <div className='GenericLabelTypePopupContent'>
                <div className='LeftContainer'>
                    {getSidebarButtons()}
                </div>
                <div className='RightContainer'>
                    {renderInternalContent(labelType)}
                </div>
            </div>
        );
    }

    return (
        <GenericYesNoPopup
            title={title}
            renderContent={renderContent}
            acceptLabel={acceptLabel}
            onAccept={() => onAccept(labelType)}
            skipAcceptButton={skipAcceptButton}
            disableAcceptButton={disableAcceptButton}
            rejectLabel={rejectLabel}
            onReject={() => onReject(labelType)} />
    );
};

const mapDispatchToProps = {};

const mapStateToProps = (state) => ({
    projectType: state.general.projectData.type
});

export default connect(mapStateToProps, mapDispatchToProps)(GenericLabelTypePopup);