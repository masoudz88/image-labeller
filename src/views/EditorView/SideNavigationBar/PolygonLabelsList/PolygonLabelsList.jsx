import React from 'react';
import Scrollbars from 'react-custom-scrollbars-2';
import './PolygonLabelsList.scss';
import {
    updateActiveLabelId,
    updateActiveLabelNameId,
    updateImageDataById
} from '../../../../store/labels/actionCreators';
import {connect} from 'react-redux';
import LabelInputField from '../LabelInputField/LabelInputField';
import EmptyLabelList from '../EmptyLabelList/EmptyLabelList';
import {LabelActions} from '../../../../logic/actions/LabelActions';
import {findLast} from 'lodash';

const PolygonLabelsList = (
    {
        size,
        imageData,
        updateImageDataByIdAction,
        labelNames,
        updateActiveLabelNameIdAction,
        activeLabelId,
        highlightedLabelId,
        updateActiveLabelIdAction
    }
) => {
    const labelInputFieldHeight = 40;
    const listStyle = {
        width: size.width,
        height: size.height
    };
    const listStyleContent = {
        width: size.width,
        height: imageData.labelPolygons.length * labelInputFieldHeight
    };

    const deletePolygonLabelById = (labelPolygonId) => {
        LabelActions.deletePolygonLabelById(imageData.id, labelPolygonId);
    };

    const togglePolygonLabelVisibilityById = (labelPolygonId) => {
        LabelActions.toggleLabelVisibilityById(imageData.id, labelPolygonId);
    };

    const updatePolygonLabel = (labelPolygonId, labelNameId) => {
        const newImageData = {
            ...imageData,
            labelPolygons: imageData.labelPolygons.map((currentLabel) => {
                if (currentLabel.id === labelPolygonId) {
                    return {
                        ...currentLabel,
                        labelId: labelNameId
                    }
                }
                return currentLabel
            })
        };
        updateImageDataByIdAction(imageData.id, newImageData);
        updateActiveLabelNameIdAction(labelNameId);
    };

    const onClickHandler = () => {
        updateActiveLabelIdAction(null);
    };

    const getChildren = () => {
        return imageData.labelPolygons.map((labelPolygon) => {
            return (
                <LabelInputField
                    size={{
                        width: size.width,
                        height: labelInputFieldHeight
                    }}
                    isActive={labelPolygon.id === activeLabelId}
                    isHighlighted={labelPolygon.id === highlightedLabelId}
                    isVisible={labelPolygon.isVisible}
                    id={labelPolygon.id}
                    key={labelPolygon.id}
                    onDelete={deletePolygonLabelById}
                    value={labelPolygon.labelId !== null ? findLast(labelNames, {id: labelPolygon.labelId}) : null}
                    options={labelNames}
                    onSelectLabel={updatePolygonLabel}
                    toggleLabelVisibility={togglePolygonLabelVisibilityById} />
            );
        });
    };

    return (
        <div
            className='PolygonLabelsList'
            style={listStyle}
            onClickCapture={onClickHandler}>
            {imageData.labelPolygons.length === 0 ?
                <EmptyLabelList
                    labelBefore={'draw your first polygon'}
                    labelAfter={'no labels created for this image yet'} /> :
                <Scrollbars>
                    <div className='PolygonLabelsListContent' style={listStyleContent}>
                        {getChildren()}
                    </div>
                </Scrollbars>
            }
        </div>
    );
};

const mapDispatchToProps = {
    updateImageDataByIdAction: updateImageDataById,
    updateActiveLabelNameIdAction: updateActiveLabelNameId,
    updateActiveLabelIdAction: updateActiveLabelId
};

const mapStateToProps = (state) => ({
    activeLabelId: state.labels.activeLabelId,
    highlightedLabelId: state.labels.highlightedLabelId,
    labelNames : state.labels.labels
});

export default connect(mapStateToProps, mapDispatchToProps)(PolygonLabelsList);
