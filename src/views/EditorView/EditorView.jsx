import React from 'react';
import './EditorView.scss';
import EditorContainer from './EditorContainer/EditorContainer';
import {connect} from 'react-redux';
import classNames from 'classnames';
import TopNavigationBar from './TopNavigationBar/TopNavigationBar';

const EditorView = ({activePopupType}) => {

    const getClassName = () => {
        return classNames('EditorView', {
            'withPopup': !!activePopupType
        });
    };

    return (
        <div className={getClassName()} draggable={false}>
            <TopNavigationBar />
            <EditorContainer />
        </div>
    );
};

const mapStateToProps = (state) => ({
    activePopupType: state.general.activePopupType
});

export default connect(mapStateToProps)(EditorView);
