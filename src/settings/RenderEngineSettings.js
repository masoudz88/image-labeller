import {Settings} from './Settings';

export class RenderEngineSettings {
    static LINE_THICKNESS = 2;
    static lineActiveColor = Settings.PRIMARY_COLOR;
    static defaultLineColor = '#ffffff';
    static CROSS_HAIR_LINE_COLOR = '#ffffff';
    static crossHairPadding = 25;
    static anchorSize = {
        width: Settings.RESIZE_HANDLE_DIMENSION_PX,
        height: Settings.RESIZE_HANDLE_DIMENSION_PX
    };
    static anchorHoverSize = {
        width: Settings.RESIZE_HANDLE_HOVER_DIMENSION_PX,
        height: Settings.RESIZE_HANDLE_HOVER_DIMENSION_PX
    };
    static suggestedAnchorDetectionSize = {
        width: 100,
        height: 100
    };
    static defaultAnchorColor = '#ffffff';
    static inactiveAnchorColor = Settings.DARK_THEME_SECOND_COLOR;

    static DEFAULT_ANCHOR_COLOR = '#ffffff';
    static ACTIVE_ANCHOR_COLOR = Settings.SECONDARY_COLOR;
    static INACTIVE_ANCHOR_COLOR = Settings.DARK_THEME_SECOND_COLOR;

    static DEFAULT_LINE_COLOR = '#ffffff';
    static ACTIVE_LINE_COLOR = Settings.PRIMARY_COLOR;
    static INACTIVE_LINE_COLOR = '#ffffff';
}
