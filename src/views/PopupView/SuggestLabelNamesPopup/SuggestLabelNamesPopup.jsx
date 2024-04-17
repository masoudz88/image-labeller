import React, {useState} from 'react'
import './SuggestLabelNamesPopup.scss'
import {connect} from 'react-redux';
import {updateRejectedSuggestedLabelList, updateSuggestedLabelList} from '../../../store/ai/actionCreators';
import {GenericYesNoPopup} from '../GenericYesNoPopup/GenericYesNoPopup';
import {PopupActions} from '../../../logic/actions/PopupActions';
import {AISelector} from '../../../store/selectors/AISelector';
import Scrollbars from 'react-custom-scrollbars-2';
import {updateLabelNames} from '../../../store/labels/actionCreators';
import {LabelsSelector} from '../../../store/selectors/LabelsSelector';
import { v4 as uuidv4 } from 'uuid';
import {ArrayUtil} from '../../../utils/ArrayUtil';
import {Settings} from '../../../settings/Settings';

const SuggestLabelNamesPopup = (
    {
        updateLabelNames,
        updateSuggestedLabelList,
        updateRejectedSuggestedLabelList
    }) => {

    const mapNamesToSelectableNames = names => {
        return names.map((name) => {
            return {
                name,
                flag: false
            }
        });
    };

    const [selectAllFlag, setSelectAllFlag] = useState(false);
    const [labelNames, setLabelNames] = useState(mapNamesToSelectableNames(AISelector.getSuggestedLabelList()));

    const onAccept = () => {
        updateLabelNames(extractSelectedNames().reduce((acc, entry, index) => {
            acc.push({
                name: entry,
                id: uuidv4(),
                color: ArrayUtil.getByInfiniteIndex(Settings.LABEL_COLORS_PALETTE, index)
            });
            return acc;
        }, LabelsSelector.getLabelNames()));
        updateRejectedSuggestedLabelList(
            AISelector.getRejectedSuggestedLabelList().concat(extractUnselectedNames())
        );
        updateSuggestedLabelList([]);
        PopupActions.close();
    };

    const onReject = () => {
        updateRejectedSuggestedLabelList(AISelector.getRejectedSuggestedLabelList().concat(extractNames()));
        updateSuggestedLabelList([]);
        PopupActions.close();
    };

    const selectAll = () => {
        setSelectAllFlag(true);
        setLabelNames(labelNames.map((entry) => {
            return {
                ...entry,
                flag: true
            }
        }))
    };

    const deselectAll = () => {
        setSelectAllFlag(false);
        setLabelNames(labelNames.map((entry) => {
            return {
                ...entry,
                flag: false
            }
        }))
    };

    const toggleSelectableNameByIndex = (index) => {
        const nextLabelNames = labelNames.map((entry, entryIndex) => {
            if (index === entryIndex)
                return {
                    ...entry,
                    flag: !entry.flag
                };
            else
                return entry;
        });
        setLabelNames(nextLabelNames);

        const nextSelectAllFlag = nextLabelNames.reduce((acc, entry) => {
            return(acc && entry.flag)
        }, true);
        setSelectAllFlag(nextSelectAllFlag);
    };

    const extractSelectedNames = () => {
        return labelNames.reduce((acc, entry) => {
            if (entry.flag) {
                acc.push(entry.name);
            }
            return acc;
        }, []);
    };

    const extractUnselectedNames = () => {
        return labelNames.reduce((acc, entry) => {
            if (!entry.flag) {
                acc.push(entry.name);
            }
            return acc;
        }, []);
    };

    const extractNames = () => {
        return labelNames.map((entry) => entry.name);
    };

    const getOptions = () => {
        return labelNames.map((entry, index) => {
            return (
                <div
                    className='OptionsItem'
                    onClick={() => toggleSelectableNameByIndex(index)}
                    key={index}>
                    {entry.flag ?
                        <img draggable={false} src={'ico/checkbox-checked.png'} alt={'checked'} /> :
                        <img draggable={false} src={'ico/checkbox-unchecked.png'} alt={'unchecked'} />}
                    {entry.name}
                </div>
            );
        });
    };

    const renderContent = () => {
        return (
            <div className='SuggestLabelNamesPopupContent'>
                <div className='Message'>
                    We found objects of classes that are not yet included in the list of labels. Select the names you
                    would like to add. This will help to speed up the labeling process.
                </div>
                <div className='AllToggle'>
                    <div
                        className='OptionsItem'
                        onClick={() => selectAllFlag ? deselectAll() : selectAll()}>
                        {selectAllFlag ?
                            <img draggable={false} src={'ico/checkbox-checked.png'} alt={'checked'} /> :
                            <img draggable={false} src={'ico/checkbox-unchecked.png'} alt={'unchecked'} />}
                        {selectAllFlag ? 'Deselect all' : 'Select all'}
                    </div>
                </div>
                <div className='LabelNamesContainer'>
                    <Scrollbars autoHeight={true}>
                        <div className='LabelNamesContent'>
                            {getOptions()}
                        </div>
                    </Scrollbars>
                </div>
            </div>
        );
    };

    return (
        <GenericYesNoPopup
            title={'New classes found'}
            renderContent={renderContent}
            acceptLabel={'Accept'}
            onAccept={onAccept}
            rejectLabel={'Reject'}
            onReject={onReject} />
    );
};

const mapDispatchToProps = {
    updateLabelNames,
    updateSuggestedLabelList,
    updateRejectedSuggestedLabelList
};

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(SuggestLabelNamesPopup);
