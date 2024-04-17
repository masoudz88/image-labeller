import classNames from "classnames";
import React from 'react';
import { connect } from "react-redux";
import { ClipLoader } from "react-spinners";
import { ImageLoadManager } from "../../../../logic/imageRepository/ImageLoadManager";
import { ImageRepository } from "../../../../logic/imageRepository/ImageRepository";
import { updateImageDataById } from "../../../../store/labels/actionCreators";
import { FileUtil } from "../../../../utils/FileUtil";
import { RectUtil } from "../../../../utils/RectUtil";
import './ImagePreview.scss';
import { CSSHelper } from "../../../../logic/helpers/CSSHelper";

class ImagePreview extends React.Component {
    isLoading = false;

    constructor(props) {
        super(props);

        this.state = {
            image: null,
        }
    }

    componentDidMount() {
        ImageLoadManager.addAndRun(this.loadImage(this.props.imageData, this.props.isScrolling));
    }

    componentWillUpdate(nextProps, nextState, nextContext) {
        if (this.props.imageData.id !== nextProps.imageData.id) {
            if (nextProps.imageData.loadStatus) {
                ImageLoadManager.addAndRun(this.loadImage(nextProps.imageData, nextProps.isScrolling));
            }
            else {
                this.setState({ image: null });
            }
        }

        if (this.props.isScrolling && !nextProps.isScrolling) {
            ImageLoadManager.addAndRun(this.loadImage(nextProps.imageData, false));
        }
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        return (
            this.props.imageData.id !== nextProps.imageData.id ||
            this.state.image !== nextState.image ||
            this.props.isSelected !== nextProps.isSelected ||
            this.props.isChecked !== nextProps.isChecked
        )
    }

    loadImage = async (imageData, isScrolling) => {
        if (imageData.loadStatus) {
            const image = ImageRepository.getById(imageData.id);
            if (this.state.image !== image) {
                this.setState({ image });
            }
        }
        else if (!isScrolling || !this.isLoading) {
            this.isLoading = true;
            const saveLoadedImagePartial = (image) => this.saveLoadedImage(image, imageData);
            FileUtil.loadImage(imageData.fileData)
                .then((image) => saveLoadedImagePartial(image))
                .catch((error) => this.handleLoadImageError())
        }
    };

    saveLoadedImage = (image, imageData) => {
        imageData.loadStatus = true;
        this.props.updateImageDataById(imageData.id, imageData);
        ImageRepository.storeImage(imageData.id, image);
        if (imageData.id === this.props.imageData.id) {
            this.setState({ image });
            this.isLoading = false;
        }
    };

    getStyle = () => {
        const { size } = this.props;

        const containerRect = {
            x: 0.15 * size.width,
            y: 0.15 * size.height,
            width: 0.7 * size.width,
            height: 0.7 * size.height
        };

        const imageRect = {
            x: 0,
            y: 0,
            width: this.state.image.width,
            height: this.state.image.height
        };

        const imageRatio = RectUtil.getRatio(imageRect);
        const imagePosition = RectUtil.fitInsideRectWithRatio(containerRect, imageRatio);

        return {
            width: imagePosition.width,
            height: imagePosition.height,
            left: imagePosition.x,
            top: imagePosition.y
        }
    };

    handleLoadImageError = () => { };

    getClassName = () => {
        return classNames("ImagePreview", {
            "selected": this.props.isSelected,
        });
    };

    render() {
        const {
            isChecked,
            style,
            onClick
        } = this.props;

        return (
            <div
                className={this.getClassName()}
                style={style}
                onClick={onClick ? onClick : undefined}>
                {(!!this.state.image) ?
                    [
                        <div className="Foreground" key={"Foreground"} style={this.getStyle()}>
                            <img
                                className="Image"
                                draggable={false}
                                src={this.state.image.src}
                                alt={this.state.image.alt}
                                style={{ ...this.getStyle(), left: 0, top: 0 }} />
                            {isChecked && <img
                                className="CheckBox"
                                draggable={false}
                                src={"ico/ok.png"}
                                alt={"checkbox"} />}
                        </div>,
                        <div className="Background" key={"Background"} style={this.getStyle()} />
                    ] :
                    <ClipLoader size={30} color={CSSHelper.getLeadingColor()} loading={true} />}
            </div>
        );
    }
}

const mapDispatchToProps = {
    updateImageDataById
};

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(ImagePreview);