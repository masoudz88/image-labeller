import {GeneralSelector} from '../../store/selectors/GeneralSelector';
import {BaseContext} from './BaseContext';
import {PopupActions} from '../actions/PopupActions';
import {Settings} from '../../settings/Settings';

export class PopupContext extends BaseContext {
    static actions = [
        {
            keyCombo: ['Escape'],
            action: (event) => {
                const popupType = GeneralSelector.getActivePopupType();
                const canBeClosed = Settings.CLOSEABLE_POPUPS.includes(popupType);
                if (canBeClosed) {
                    PopupActions.close();
                }
            }
        }
    ];
}
