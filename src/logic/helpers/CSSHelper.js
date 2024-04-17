import {Settings} from '../../settings/Settings';
import {AISelector} from '../../store/selectors/AISelector';

export class CSSHelper {
    static getLeadingColor() {
        return AISelector.isAISSDObjectDetectorModelLoaded() || AISelector.isAIYOLOObjectDetectorModelLoaded() ||
            AISelector.isAIPoseDetectorModelLoaded() ? Settings.PRIMARY_COLOR : Settings.SECONDARY_COLOR;
    }
}
