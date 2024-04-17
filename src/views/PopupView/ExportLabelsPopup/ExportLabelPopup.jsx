import React, { useState } from 'react';
import './ExportLabelPopup.scss';
import { RectLabelsExporter } from '../../../logic/export/RectLabelsExporter';
import { LabelType } from '../../../data/enums/LabelType';
import { PointLabelsExporter } from '../../../logic/export/PointLabelsExport';
import { PolygonLabelsExporter } from '../../../logic/export/polygon/PolygonLabelsExporter';
import { PopupActions } from '../../../logic/actions/PopupActions';
import { LineLabelsExporter } from '../../../logic/export/LineLabelExport';
import { TagLabelsExporter } from '../../../logic/export/TagLabelsExport';
import GenericLabelTypePopup from '../GenericLabelTypePopup/GenericLabelTypePopup';
import { ExportFormatData } from '../../../data/ExportFormatData';
import { connect } from 'react-redux';

const ExportLabelPopup = ({ activeLabelType }) => {
    const [labelType, setLabelType] = useState(activeLabelType);
    const [exportFormatType, setExportFormatType] = useState(null);

    const onAccept = (type) => {
        switch (type) {
            case LabelType.RECT:
                RectLabelsExporter.export(exportFormatType);
                break;
            case LabelType.POINT:
                PointLabelsExporter.export(exportFormatType);
                break;
            case LabelType.LINE:
                LineLabelsExporter.export(exportFormatType);
                break;
            case LabelType.POLYGON:
                PolygonLabelsExporter.export(exportFormatType);
                break;
            case LabelType.IMAGE_RECOGNITION:
                TagLabelsExporter.export(exportFormatType);
                break;
        }
        PopupActions.close();
    };

    const onReject = (type) => {
        PopupActions.close();
    };

    const onSelect = (type) => {
        setExportFormatType(type);
    };

    const getOptions = (exportFormatData) => {
        return exportFormatData.map((entry) => {
            return (
                <div
                    className='OptionsItem'
                    onClick={() => onSelect(entry.type)}
                    key={entry.type}>
                    {entry.type === exportFormatType ?
                        <img draggable={false} src={'ico/checkbox-checked.png'} alt={'checked'} /> :
                        <img draggable={false} src={'ico/checkbox-unchecked.png'} alt={'unchecked'} />}
                    {entry.label}
                </div>
            );
        });
    };

    const renderInternalContent = (type) => {
        return <>
            <div className='Message'>
                Select label type and the file format you would like to use to export labels.
            </div>,
            <div className='Options'>
                {getOptions(ExportFormatData[type])}
            </div>
        </>;
    };

    const onLabelTypeChange = (type) => {
        setLabelType(type);
        setExportFormatType(null);
    };

    return (
        <GenericLabelTypePopup
            activeLabelType={labelType}
            title={`Export ${labelType.toLowerCase()} annotations`}
            onLabelTypeChange={onLabelTypeChange}
            acceptLabel={'Export'}
            onAccept={onAccept}
            disableAcceptButton={!exportFormatType}
            rejectLabel={'Cancel'}
            onReject={onReject}
            renderInternalContent={renderInternalContent} />
    );
};

const mapDispatchToProps = {};

const mapStateToProps = (state) => ({
    activeLabelType: state.labels.activeLabelType,
});

export default connect(mapStateToProps, mapDispatchToProps)(ExportLabelPopup);