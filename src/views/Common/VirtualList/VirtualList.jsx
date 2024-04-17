import React from 'react';
import Scrollbars from 'react-custom-scrollbars-2';
import {VirtualListUtil} from "../../../utils/VirtualListUtil";
import {RectUtil} from "../../../utils/RectUtil";

export class VirtualList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            viewportRect: null,
            isScrolling: false
        };
    }

    componentDidMount() {
        const {size, childSize, childCount} = this.props;
        this.calculate(size, childSize, childCount);
        this.setState({
            viewportRect: {
                x: 0,
                y: 0,
                width: this.props.size.width,
                height: this.props.size.height
            }
        });
    }

    componentWillUpdate(nextProps, nextState, nextContext) {
        const {size, childSize, childCount} = nextProps;
        if (this.props.size.height !== size.height || this.props.size.width !== size.width ||
            this.props.childCount !== childCount) {
            this.calculate(size, childSize, childCount);
            this.setState({
                viewportRect: {
                    x: this.scrollbars.getValues().scrollLeft,
                    y: this.scrollbars.getValues().scrollTop,
                    width: size.width,
                    height: size.height
                }
            });
        }
    }

    calculate = (size, childSize, childCount) => {
        this.gridSize = VirtualListUtil.calculateGridSize(size, childSize, childCount);
        this.contentSize = VirtualListUtil.calculateContentSize(size, childSize, this.gridSize);
        this.childAnchors = VirtualListUtil.calculateAnchorPoints(size, childSize, childCount);
    };

    getVirtualListStyle = () => {
        return {
            position: "relative",
            width: this.props.size.width,
            height: this.props.size.height,
        }
    };

    getVirtualListContentStyle = () => {
        return {
            width: this.contentSize.width,
            height: this.contentSize.height,
        }
    };

    onScrollStart = () => {
        this.setState({isScrolling: true});
    };

    onScrollStop = () => {
        this.setState({isScrolling: false});
    };

    onScroll = (values) => {
        this.setState({
            viewportRect: {
                x: values.scrollLeft,
                y: values.scrollTop,
                width: this.props.size.width,
                height: this.props.size.height
            }
        });
    };

    getChildren = () => {
        const {viewportRect, isScrolling} = this.state;
        const {overScanHeight, childSize} = this.props;
        const overScan = !!overScanHeight ? overScanHeight : 0;

        const viewportRectWithOverScan = {
            x: viewportRect.x,
            y: viewportRect.y - overScan,
            width: viewportRect.width,
            height: viewportRect.height + 2 * overScan
        };

        return this.childAnchors.reduce((children, anchor, index) => {
            const childRect = Object.assign(anchor, childSize);
            const isVisible = RectUtil.intersect(viewportRectWithOverScan, childRect);

            if (isVisible) {
                const childStyle = {
                    position: "absolute",
                    left: anchor.x,
                    top: anchor.y,
                    width: childSize.width,
                    height: childSize.height
                };

                return children.concat(this.props.childRender(index, isScrolling, isVisible, childStyle));
            }
            else {
                return children;
            }
        }, []);
    };

    render() {
        const displayContent = !!this.props.size && !!this.props.childSize && !!this.gridSize;

        return (
            <div className="VirtualList" style={this.getVirtualListStyle()}>
                <Scrollbars
                    ref={ref => this.scrollbars = ref}
                    onScrollFrame={this.onScroll}
                    onScrollStart={this.onScrollStart}
                    onScrollStop={this.onScrollStop}
                    autoHide={true}>
                    {displayContent && <div className="VirtualListContent" style={this.getVirtualListContentStyle()}>
                        {this.getChildren()}
                    </div>}
                </Scrollbars>
            </div>
        );
    }
}