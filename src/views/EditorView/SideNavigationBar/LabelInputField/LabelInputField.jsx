import React from 'react';
import './LabelInputField.scss';
import classNames from 'classnames';
import {ImageButton} from '../../../Common/ImageButton/ImageButton';
import {RectUtil} from '../../../../utils/RectUtil';
import {connect} from 'react-redux';
import {updateActiveLabelId, updateHighlightedLabelId} from '../../../../store/labels/actionCreators';
import Scrollbars from 'react-custom-scrollbars-2';
import {EventType} from '../../../../data/enums/EventType';
import {LabelsSelector} from '../../../../store/selectors/LabelsSelector';
import {PopupWindowType} from '../../../../data/enums/PopupWindowType';
import {updateActivePopupType} from '../../../../store/general/actionCreators';
import {truncate} from 'lodash';
import { Settings } from '../../../../settings/Settings';

class LabelInputField extends React.Component {
    dropdownOptionHeight = 30;
    dropdownOptionCount = 6;
    dropdownMargin = 4;

    constructor(props) {
        super(props);
        this.state = {
            animate: false,
            isOpen: false
        }
    }

    componentDidMount() {
        requestAnimationFrame(() => {
            this.setState({ animate: true });
        });
    }

    getClassName() {
        return classNames('LabelInputField', {
            'loaded': this.state.animate,
            'active': this.props.isActive,
            'highlighted': this.props.isHighlighted
        });
    }

    openDropdown = () => {
        if (LabelsSelector.getLabelNames().length === 0) {
            this.props.updateActivePopupType(PopupWindowType.UPDATE_LABEL);
        } else {
            this.setState({isOpen: true});
            window.addEventListener(EventType.MOUSE_DOWN, this.closeDropdown);
        }
    };

    closeDropdown = (event) => {
        const mousePosition = {x: event.clientX, y: event.clientY};
        const clientRect = this.dropdown.getBoundingClientRect();
        const dropDownRect = {
            x: clientRect.left,
            y: clientRect.top,
            width: clientRect.width,
            height: clientRect.height
        };

        if (!RectUtil.isPointInside(dropDownRect, mousePosition)) {
            this.setState({isOpen: false});
            window.removeEventListener(EventType.MOUSE_DOWN, this.closeDropdown)
        }
    };

    getDropdownStyle = () => {
        const clientRect = this.dropdownLabel.getBoundingClientRect();
        const height = Math.min(this.props.options.length, this.dropdownOptionCount) * this.dropdownOptionHeight;
        const style = {
            width: clientRect.width,
            height,
            left: clientRect.left
        };

        if (window.innerHeight * 2/3 < clientRect.top)
            return Object.assign(style, {top: clientRect.top - this.dropdownMargin - height});
        else
            return Object.assign(style, {top: clientRect.bottom + this.dropdownMargin});
    };

    getDropdownOptions = () => {
        const wrapOnClick = id => {
            return (event) => {
                this.setState({isOpen: false});
                window.removeEventListener(EventType.MOUSE_DOWN, this.closeDropdown);
                this.props.onSelectLabel(this.props.id, id);
                this.props.updateHighlightedLabelId(null);
                this.props.updateActiveLabelId(this.props.id);
                event.stopPropagation();
            };
        }

        return this.props.options.map((option) => {
            return (
                <div
                    className='DropdownOption'
                    key={option.id}
                    style={{height: this.dropdownOptionHeight}}
                    onClick={wrapOnClick(option.id)}>
                    {truncate(option.name, {length: Settings.MAX_DROPDOWN_OPTION_LENGTH})}
                </div>
            );
        });
    };

    mouseEnterHandler = () => {
        this.props.updateHighlightedLabelId(this.props.id);
    };

    mouseLeaveHandler = () => {
        this.props.updateHighlightedLabelId(null);
    };

    onClickHandler = () => {
        this.props.updateActiveLabelId(this.props.id);
    };

    getToggleVisibilityButton = (id) => {
        if (this.props.toggleLabelVisibility === undefined) {
            return null
        }
        return (
            <ImageButton
                externalClassName={'icon'}
                image={this.props.isVisible ? 'ico/eye.png' : 'ico/hide.png'}
                imageAlt={'label is hidden'}
                buttonSize={{width: 28, height: 28}}
                onClick={() => this.props.toggleLabelVisibility(id)} />
        );
    };

    render() {
        const {size, id, value, onDelete} = this.props;
        return (
            <div
                className={this.getClassName()}
                style={{
                    width: size.width,
                    height: size.height,
                }}
                key={id}
                onMouseEnter={this.mouseEnterHandler}
                onMouseLeave={this.mouseLeaveHandler}
                onClick={this.onClickHandler}>
                <div
                    className='LabelInputFieldWrapper'
                    style={{
                        width: size.width,
                        height: size.height,
                    }}>
                    <div className='Marker' style={value ? {backgroundColor: value.color} : {}} />
                    <div className='Content'>
                        <div className='ContentWrapper'>
                            <div
                                className='DropdownLabel'
                                ref={ref => this.dropdownLabel = ref}
                                onClick={this.openDropdown}>
                                {value ? truncate(value.name, {length: Settings.MAX_DROPDOWN_OPTION_LENGTH}) : 'Select label'}
                            </div>
                            {this.state.isOpen && <div
                                className='Dropdown'
                                style={this.getDropdownStyle()}
                                ref={ref => this.dropdown = ref}>
                                <Scrollbars
                                    renderTrackHorizontal={props => <div {...props} className='track-horizontal' />}>
                                    <div>
                                        {this.getDropdownOptions()}
                                    </div>
                                </Scrollbars>

                            </div>}
                        </div>
                        <div className='ContentWrapper'>
                            {this.getToggleVisibilityButton(id)}
                            <ImageButton
                                externalClassName={'icon'}
                                image={'ico/trash.png'}
                                imageAlt={'remove label'}
                                buttonSize={{width: 28, height: 28}}
                                onClick={() => onDelete(id)} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapDispatchToProps = {
    updateHighlightedLabelId,
    updateActiveLabelId,
    updateActivePopupType
};

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(LabelInputField);
