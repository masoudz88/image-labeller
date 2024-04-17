import React from 'react';
import './StateBar.scss';
import {connect} from "react-redux";
import {LabelType} from "../../../data/enums/LabelType";

const StateBar = ({imagesData, activeLabelType}) => {

    const pointLabeledImages = imagesData.reduce((currentCount, currentImage) => {
        return currentCount + (currentImage.labelPoints.length > 0 ? 1 : 0);
    }, 0);

    const rectLabeledImages = imagesData.reduce((currentCount, currentImage) => {
        return currentCount + (currentImage.labelRects.length > 0 ? 1 : 0);
    }, 0);

    const polygonLabeledImages = imagesData.reduce((currentCount, currentImage) => {
        return currentCount + (currentImage.labelPolygons.length > 0 ? 1 : 0);
    }, 0);

    const lineLabeledImages = imagesData.reduce((currentCount, currentImage) => {
        return currentCount + (currentImage.labelLines.length > 0 ? 1 : 0);
    }, 0);

    const tagLabeledImages = imagesData.reduce((currentCount, currentImage) => {
        return currentCount + (currentImage.labelNameIds.length !== 0 ? 1 : 0);
    }, 0);

    const getProgress = () => {
        switch (activeLabelType) {
            case LabelType.POINT:
                return (100 * pointLabeledImages) / imagesData.length;
            case LabelType.RECT:
                return (100 * rectLabeledImages) / imagesData.length;
            case LabelType.POLYGON:
                return (100 * polygonLabeledImages) / imagesData.length;
            case LabelType.LINE:
                return (100 * lineLabeledImages) / imagesData.length;
            case LabelType.IMAGE_RECOGNITION:
                return (100 * tagLabeledImages) / imagesData.length;
            default:
                return 0;
        }
    };

    return (
        <div className="StateBar">
            <div style={{width: getProgress() + "%"}} className="done" />
        </div>
    );
};

const mapDispatchToProps = {};

const mapStateToProps = (state) => ({
    imagesData: state.labels.imagesData,
    activeLabelType: state.labels.activeLabelType
});

export default connect(mapStateToProps, mapDispatchToProps)(StateBar);