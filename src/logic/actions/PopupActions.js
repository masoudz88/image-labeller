import {ContextManager} from '../context/ContextManager';
import {store} from '../../index';
import {updateActivePopupType} from '../../store/general/actionCreators';

export class PopupActions {
    static close() {
        store.dispatch(updateActivePopupType(null));
        ContextManager.restoreCtx();
    }
}