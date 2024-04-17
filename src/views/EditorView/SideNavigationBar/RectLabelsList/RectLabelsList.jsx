import React from 'react';
import Scrollbars from 'react-custom-scrollbars-2';
import './RectLabelsList.scss';
import {
    updateActiveLabelId,
    updateActiveLabelNameId,
    updateImageDataById
} from '../../../../store/labels/actionCreators';
import {connect} from 'react-redux';
import LabelInputField from '../LabelInputField/LabelInputField';
import EmptyLabelList from '../EmptyLabelList/EmptyLabelList';
import {LabelActions} from '../../../../logic/actions/LabelActions';
import {LabelStatus} from '../../../../data/enums/LabelStatus';
import {findLast} from 'lodash';

const RectLabelsList = (
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
        height: imageData.labelRects.length * labelInputFieldHeight
    };

    const deleteRectLabelById = (labelRectId) => {
        LabelActions.deleteRectLabelById(imageData.id, labelRectId);
    };

    const toggleRectLabelVisibilityById = (labelRectId) => {
        LabelActions.toggleLabelVisibilityById(imageData.id, labelRectId);
    };

    const updateRectLabel = (labelRectId, labelNameId) => {
        const newImageData = {
            ...imageData,
            labelRects: imageData.labelRects
                .map((labelRect) => {
                    if (labelRect.id === labelRectId) {
                        return {
                            ...labelRect,
                            labelId: labelNameId,
                            status: LabelStatus.ACCEPTED
                        }
                    } else {
                        return labelRect
                    }
                })
        };
        updateImageDataByIdAction(imageData.id, newImageData);
        updateActiveLabelNameIdAction(labelNameId);
    };

    const onClickHandler = () => {
        updateActiveLabelIdAction(null);
    };

    const getChildren = () => {
        return imageData.labelRects
            .filter((labelRect) => labelRect.status === LabelStatus.ACCEPTED)
            .map((labelRect) => {
                return (
                    <LabelInputField
                        size={{
                            width: size.width,
                            height: labelInputFieldHeight
                        }}
                        isActive={labelRect.id === activeLabelId}
                        isHighlighted={labelRect.id === highlightedLabelId}
                        isVisible={labelRect.isVisible}
                        id={labelRect.id}
                        key={labelRect.id}
                        onDelete={deleteRectLabelById}
                        value={labelRect.labelId !== null ? findLast(labelNames, {id: labelRect.labelId}) : null}
                        options={labelNames}
                        onSelectLabel={updateRectLabel}
                        toggleLabelVisibility={toggleRectLabelVisibilityById} />
                );
            });
    };

    return (
        <div
            className='RectLabelsList'
            style={listStyle}
            onClickCapture={onClickHandler}>
            {imageData.labelRects.filter((labelRect) => labelRect.status === LabelStatus.ACCEPTED).length === 0 ?
                <EmptyLabelList
                    labelBefore={'draw your first bounding box'}
                    labelAfter={'no labels created for this image yet'} /> :
                <Scrollbars>
                    <div className='RectLabelsListContent' style={listStyleContent}>
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

export default connect(mapStateToProps, mapDispatchToProps)(RectLabelsList);
