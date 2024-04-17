import React from 'react';
import './TopNavigationBar.scss';
import StateBar from '../StateBar/StateBar';
import {PopupWindowType} from '../../../data/enums/PopupWindowType';
import {connect} from 'react-redux';
import {updateActivePopupType, updateProjectData} from '../../../store/general/actionCreators';
import TextInput from '../../Common/TextInput/TextInput';
import {ImageButton} from '../../Common/ImageButton/ImageButton';
import {Settings} from '../../../settings/Settings';
import DropDownMenu from './DropDownMenu/DropDownMenu';

const TopNavigationBar = (props) => {
    const onFocus = (event) => {
        event.target.setSelectionRange(0, event.target.value.length);
    };

    const onChange = (event) => {
        const value = event.target.value
            .toLowerCase()
            .replace(' ', '-');

        props.updateProjectDataAction({
            ...props.projectData,
            name: value
        })
    };

    const closePopup = () => props.updateActivePopupTypeAction(PopupWindowType.EXIT_PROJECT)

    return (
        <div className='TopNavigationBar'>
            <StateBar />
            <div className='TopNavigationBarWrapper'>
                <div className='NavigationBarGroupWrapper'>
                    <div className='Header' onClick={closePopup}>
                        <img
                            draggable={false}
                            alt={'make-sense'}
                            src={'/make-sense-ico-transparent.png'} />
                        Make Sense
                    </div>
                </div>
                <div className='NavigationBarGroupWrapper'>
                    <DropDownMenu />
                </div>
                <div className='NavigationBarGroupWrapper middle'>
                    <div className='ProjectName'>Project Name:</div>
                    <TextInput
                        isPassword={false}
                        value={props.projectData.name}
                        onChange={onChange}
                        onFocus={onFocus} />
                </div>
                <div className='NavigationBarGroupWrapper'>
                    <ImageButton
                        image={'ico/github-logo.png'}
                        imageAlt={'github-logo.png'}
                        buttonSize={{width: 30, height: 30}}
                        href={Settings.GITHUB_URL} />
                </div>
            </div>
        </div>
    );
};

const mapDispatchToProps = {
    updateActivePopupTypeAction: updateActivePopupType,
    updateProjectDataAction: updateProjectData
};

const mapStateToProps = (state) => ({
    projectData: state.general.projectData
});

export default connect(mapStateToProps, mapDispatchToProps)(TopNavigationBar);
