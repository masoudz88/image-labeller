import React from 'react';
import {connect} from "react-redux";
import {LabelType} from "../../../../data/enums/LabelType";
import {VirtualList} from "../../../Common/VirtualList/VirtualList";
import ImagePreview from "../ImagePreview/ImagePreview";
import './ImagesList.scss';
import {ContextManager} from "../../../../logic/context/ContextManager";
import {ContextType} from "../../../../data/enums/ContextType";
import {ImageActions} from "../../../../logic/actions/ImageActions";
import {EventType} from "../../../../data/enums/EventType";
import {LabelStatus} from "../../../../data/enums/LabelStatus";

class ImagesList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            size: null,
        }
    }

    componentDidMount() {
        this.updateListSize();
        window.addEventListener(EventType.RESIZE, this.updateListSize);
    }

    componentWillUnmount() {
        window.removeEventListener(EventType.RESIZE, this.updateListSize);
    }

    updateListSize = () => {
        if (!this.imagesListRef)
            return;

        const listBoundingBox = this.imagesListRef.getBoundingClientRect();
        this.setState({
            size: {
                width: listBoundingBox.width,
                height: listBoundingBox.height
            }
        })
    };

    isImageChecked = index => {
        const imageData = this.props.imagesData[index]
        switch (this.props.activeLabelType) {
            case LabelType.LINE:
                return imageData.labelLines.length > 0
            case LabelType.IMAGE_RECOGNITION:
                return imageData.labelNameIds.length > 0
            case LabelType.POINT:
                return imageData.labelPoints
                    .filter((labelPoint) => labelPoint.status === LabelStatus.ACCEPTED)
                    .length > 0;
            case LabelType.POLYGON:
                return imageData.labelPolygons.length > 0
            case LabelType.RECT:
                return imageData.labelRects
                    .filter((labelRect) => labelRect.status === LabelStatus.ACCEPTED)
                    .length > 0;
        }
    };

    onClickHandler = (index) => {
        ImageActions.getImageByIndex(index)
    };

    renderImagePreview = (index, isScrolling, isVisible, style) => {
        return (
            <ImagePreview
                key={index}
                style={style}
                size={{width: 150, height: 150}}
                isScrolling={isScrolling}
                isChecked={this.isImageChecked(index)}
                imageData={this.props.imagesData[index]}
                onClick={() => this.onClickHandler(index)}
                isSelected={this.props.activeImageIndex === index} />
        );
    };

    render() {
        const { size } = this.state;
        return (
            <div
                className="ImagesList"
                ref={ref => this.imagesListRef = ref}
                onClick={() => ContextManager.switchCtx(ContextType.LEFT_NAVBAR)}>
                {!!size && <VirtualList
                    size={size}
                    childSize={{width: 150, height: 150}}
                    childCount={this.props.imagesData.length}
                    childRender={this.renderImagePreview}
                    overScanHeight={200} />}
            </div>
        );
    }
}

const mapDispatchToProps = {};

const mapStateToProps = (state) => ({
    activeImageIndex: state.labels.activeImageIndex,
    imagesData: state.labels.imagesData,
    activeLabelType: state.labels.activeLabelType
});

export default connect(mapStateToProps, mapDispatchToProps)(ImagesList);