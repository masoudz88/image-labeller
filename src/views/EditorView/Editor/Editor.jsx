import React from 'react';
import './Editor.scss';
import {FileUtil} from '../../../utils/FileUtil';
import {connect} from 'react-redux';
import {updateImageDataById} from '../../../store/labels/actionCreators';
import {ImageRepository} from '../../../logic/imageRepository/ImageRepository';
import {LabelType} from '../../../data/enums/LabelType';
import {CanvasUtil} from '../../../utils/CanvasUtil';
import {ImageLoadManager} from '../../../logic/imageRepository/ImageLoadManager';
import {EventType} from '../../../data/enums/EventType';
import {EditorModel} from '../../../staticModels/EditorModel';
import {EditorActions} from '../../../logic/actions/EditorActions';
import {EditorUtil} from '../../../utils/EditorUtil';
import {ContextManager} from '../../../logic/context/ContextManager';
import {ContextType} from '../../../data/enums/ContextType';
import Scrollbars from 'react-custom-scrollbars-2';
import {ViewPortActions} from '../../../logic/actions/ViewPortActions';
import {PlatformModel} from '../../../staticModels/PlatformModel';
import LabelControlPanel from '../LabelControlPanel/LabelControlPanel';
import {RenderEngineUtil} from '../../../utils/RenderEngineUtil';
import {LabelStatus} from '../../../data/enums/LabelStatus';
import {isEqual} from 'lodash';
import {AIActions} from '../../../logic/actions/AIActions';

class Editor extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            viewPortSize: {
                width: 0,
                height: 0
            },
        };
    }

    // =================================================================================================================
    // LIFE CYCLE
    // =================================================================================================================

    componentDidMount() {
        this.mountEventListeners();

        const {imageData, activeLabelType} = this.props;

        ContextManager.switchCtx(ContextType.EDITOR);
        EditorActions.mountRenderEnginesAndHelpers(activeLabelType);
        ImageLoadManager.addAndRun(this.loadImage(imageData));
        ViewPortActions.resizeCanvas(this.props.size);
    }

    componentWillUnmount() {
        this.unmountEventListeners();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {imageData, activeLabelType} = this.props;

        prevProps.imageData.id !== imageData.id && ImageLoadManager.addAndRun(this.loadImage(imageData));

        if (prevProps.activeLabelType !== activeLabelType) {
            EditorActions.swapSupportRenderingEngine(activeLabelType);
            AIActions.detect(imageData.id, ImageRepository.getById(imageData.id));
        }

        this.updateModelAndRender();
    }

    // =================================================================================================================
    // EVENT HANDLERS
    // =================================================================================================================

    mountEventListeners() {
        window.addEventListener(EventType.MOUSE_MOVE, this.update);
        window.addEventListener(EventType.MOUSE_UP, this.update);
        EditorModel.canvas.addEventListener(EventType.MOUSE_DOWN, this.update);
        EditorModel.canvas.addEventListener(EventType.MOUSE_WHEEL, this.handleZoom);
    }

    unmountEventListeners() {
        window.removeEventListener(EventType.MOUSE_MOVE, this.update);
        window.removeEventListener(EventType.MOUSE_UP, this.update);
        EditorModel.canvas.removeEventListener(EventType.MOUSE_DOWN, this.update);
        EditorModel.canvas.removeEventListener(EventType.MOUSE_WHEEL, this.handleZoom);
    }

    // =================================================================================================================
    // LOAD IMAGE
    // =================================================================================================================

    loadImage = async imageData => {
        if (imageData.loadStatus) {
            EditorActions.setActiveImage(ImageRepository.getById(imageData.id));
            AIActions.detect(imageData.id, ImageRepository.getById(imageData.id));
            this.updateModelAndRender()
        }
        else {
            if (!EditorModel.isLoading) {
                EditorActions.setLoadingStatus(true);
                const saveLoadedImagePartial = (image) => this.saveLoadedImage(image, imageData);
                FileUtil.loadImage(imageData.fileData)
                    .then((image) => saveLoadedImagePartial(image))
                    .catch((error) => this.handleLoadImageError())
            }
        }
    };

    saveLoadedImage = (image, imageData) => {
        imageData.loadStatus = true;
        this.props.updateImageDataById(imageData.id, imageData);
        ImageRepository.storeImage(imageData.id, image);
        EditorActions.setActiveImage(image);
        AIActions.detect(imageData.id, image);
        EditorActions.setLoadingStatus(false);
        this.updateModelAndRender()
    };

    handleLoadImageError = () => {};

    // =================================================================================================================
    // HELPER METHODS
    // =================================================================================================================

    updateModelAndRender = () => {
        ViewPortActions.updateViewPortSize();
        ViewPortActions.updateDefaultViewPortImageRect();
        ViewPortActions.resizeViewPortContent();
        EditorActions.fullRender();
    };

    update = (event) => {
        const editorData = EditorActions.getEditorData(event);
        EditorModel.mousePositionOnViewPortContent = CanvasUtil.getMousePositionOnCanvasFromEvent(event, EditorModel.canvas);
        EditorModel.primaryRenderingEngine.update(editorData);

        if (this.props.imageDragMode) {
            EditorModel.viewPortHelper.update(editorData);
        } else {
            EditorModel.supportRenderingEngine && EditorModel.supportRenderingEngine.update(editorData);
        }

        !this.props.activePopupType && EditorActions.updateMousePositionIndicator(event);
        EditorActions.fullRender();
    };

    handleZoom = (event) => {
        if (event.ctrlKey || (PlatformModel.isMac && event.metaKey)) {
            const scrollSign = Math.sign(event.deltaY);
            if ((PlatformModel.isMac && scrollSign === -1) || (!PlatformModel.isMac && scrollSign === 1)) {
                ViewPortActions.zoomOut();
            }
            else if ((PlatformModel.isMac && scrollSign === 1) || (!PlatformModel.isMac && scrollSign === -1)) {
                ViewPortActions.zoomIn();
            }
        }
        EditorModel.mousePositionOnViewPortContent = CanvasUtil.getMousePositionOnCanvasFromEvent(event, EditorModel.canvas);
    };

    getOptionsPanels = () => {
        const editorData = EditorActions.getEditorData();
        if (this.props.activeLabelType === LabelType.RECT) {
            return this.props.imageData.labelRects
                .filter(
                (labelRect) => labelRect.isCreatedByAI && labelRect.status !== LabelStatus.ACCEPTED
            )
                .map((labelRect) => {
                    const positionOnImage = {x: labelRect.rect.x, y: labelRect.rect.y};
                    const positionOnViewPort = RenderEngineUtil.transferPointFromImageToViewPortContent(positionOnImage, editorData);
                    return (
                        <LabelControlPanel
                            position={positionOnViewPort}
                            labelData={labelRect}
                            imageData={this.props.imageData}
                            key={labelRect.id} />
                    );
                });
        }
        else if (this.props.activeLabelType === LabelType.POINT) {
            return this.props.imageData.labelPoints
                .filter(
                (labelPoint) => labelPoint.isCreatedByAI && labelPoint.status !== LabelStatus.ACCEPTED
            )
                .map((labelPoint) => {
                    const positionOnImage = {x: labelPoint.point.x, y: labelPoint.point.y};
                    const positionOnViewPort = RenderEngineUtil.transferPointFromImageToViewPortContent(positionOnImage, editorData);
                    return (
                        <LabelControlPanel
                            position={positionOnViewPort}
                            labelData={labelPoint}
                            imageData={this.props.imageData}
                            key={labelPoint.id} />
                    );
                });
        }
        else return null;
    };

    onScrollbarsUpdate = (scrollbarContent)=>{
        const newViewPortContentSize = {
            width: scrollbarContent.scrollWidth,
            height: scrollbarContent.scrollHeight
        };
        if(!isEqual(newViewPortContentSize, this.state.viewPortSize)) {
            this.setState({viewPortSize: newViewPortContentSize})
        }
    };

    render() {
        return (
            <div
                className='Editor'
                ref={ref => EditorModel.editor = ref}
                draggable={false}>
                <Scrollbars
                    ref={ref => EditorModel.viewPortScrollbars = ref}
                    renderTrackHorizontal={props => <div {...props} className='track-horizontal' />}
                    renderTrackVertical={props => <div {...props} className='track-vertical' />}
                    onUpdate={this.onScrollbarsUpdate}>
                    <div className='ViewPortContent'>
                        <canvas
                            className='ImageCanvas'
                            ref={ref => EditorModel.canvas = ref}
                            draggable={false}
                            onContextMenu={(event) => event.preventDefault()} />
                        {this.getOptionsPanels()}
                    </div>
                </Scrollbars>
                <div
                    className='MousePositionIndicator'
                    ref={ref => EditorModel.mousePositionIndicator = ref}
                    draggable={false} />
                <div
                    className={EditorUtil.getCursorStyle(this.props.customCursorStyle)}
                    ref={ref => EditorModel.cursor = ref}
                    draggable={false}>
                    <img
                        draggable={false}
                        alt={'indicator'}
                        src={EditorUtil.getIndicator(this.props.customCursorStyle)} />
                </div>
            </div>
        );
    }
}

const mapDispatchToProps = {
    updateImageDataById
};

const mapStateToProps = (state) => ({
    activeLabelType: state.labels.activeLabelType,
    activePopupType: state.general.activePopupType,
    activeLabelId: state.labels.activeLabelId,
    customCursorStyle: state.general.customCursorStyle,
    imageDragMode: state.general.imageDragMode,
    zoom: state.general.zoom
});

export default connect(mapStateToProps, mapDispatchToProps)(Editor);
