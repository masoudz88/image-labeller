import React from 'react';
import classNames from 'classnames';
import './SideNavigationBar.scss';
import {Direction} from "../../../data/enums/Direction";

export const SideNavigationBar = (props) => {
    const {direction, isOpen, isWithContext, renderContent, renderCompanion} = props;

    const getClassName = () => {
        return classNames("SideNavigationBar", {
            "left": direction === Direction.LEFT,
            "right": direction === Direction.RIGHT,
            "with-context": isWithContext,
            "closed": !isOpen
        });
    };

    return (
        <div className={getClassName()}>
            <div className="CompanionBar">
                {renderCompanion && renderCompanion()}
            </div>
            {isOpen && <div className="NavigationBarContentWrapper">
                {renderContent && renderContent()}
            </div>}
        </div>
    );
};