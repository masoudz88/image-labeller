import {PopupWindowType} from '../data/enums/PopupWindowType';

export class Settings {
    static GITHUB_URL = 'https://github.com/SkalskiP';
    static MEDIUM_URL = 'https://medium.com/@piotr.skalski92';
    static TWITCH_URL = 'https://www.twitch.tv/skalskip';
    static YOUTUBE_URL = 'https://www.youtube.com/watch?v=AWjKfjDGiYE';

    static TOP_NAVIGATION_BAR_HEIGHT_PX = 35;
    static EDITOR_BOTTOM_NAVIGATION_BAR_HEIGHT_PX = 40 + 1;
    static EDITOR_TOP_NAVIGATION_BAR_HEIGHT_PX = 40 + 1;
    static SIDE_NAVIGATION_BAR_WIDTH_CLOSED_PX = 23 + 1;
    static SIDE_NAVIGATION_BAR_WIDTH_OPEN_PX = Settings.SIDE_NAVIGATION_BAR_WIDTH_CLOSED_PX + 300 + 1;
    static TOOLKIT_TAB_HEIGHT_PX = 40;
    static TOOLBOX_PANEL_WIDTH_PX = 50 + 1;
    static MAX_DROPDOWN_OPTION_LENGTH = 20;

    static EDITOR_MIN_WIDTH = 900;
    static EDITOR_MIN_HEIGHT = 500;

    static PRIMARY_COLOR = '#2af598';
    static SECONDARY_COLOR = '#009efd';

    static DARK_THEME_FIRST_COLOR = '#171717';
    static DARK_THEME_SECOND_COLOR = '#282828';
    static DARK_THEME_THIRD_COLOR = '#4c4c4c';
    static DARK_THEME_FORTH_COLOR = '#262c2f';

    static CROSS_HAIR_THICKNESS_PX = 1;
    static CROSS_HAIR_COLOR = '#fff';

    static RESIZE_HANDLE_DIMENSION_PX = 8;
    static RESIZE_HANDLE_HOVER_DIMENSION_PX = 16;

    static CLOSEABLE_POPUPS = [
        PopupWindowType.IMPORT_IMAGES,
        PopupWindowType.EXPORT_ANNOTATIONS,
        PopupWindowType.IMPORT_ANNOTATIONS,
        PopupWindowType.EXIT_PROJECT,
        PopupWindowType.UPDATE_LABEL,
        PopupWindowType.LOAD_AI_MODEL,
        PopupWindowType.LOAD_YOLO_V5_MODEL
    ];

    static LABEL_COLORS_PALETTE = [
        '#ff3838',
        '#ff9d97',
        '#ff701f',
        '#ffb21d',
        '#cff231',
        '#48f90a',
        '#92cc17',
        '#3ddb86',
        '#1a9334',
        '#00d4bb',
        '#2c99a8',
        '#00c2ff',
        '#344593',
        '#6473ff',
        '#0018ec',
        '#8438ff',
        '#520085',
        '#cb38ff',
        '#ff95c8',
        '#ff37c7'
    ];

    static CSV_SEPARATOR = ',';
    static RECT_LABELS_EXPORT_CSV_COLUMN_NAMES = [
        'label_name',
        'bbox_x',
        'bbox_y',
        'bbox_width',
        'bbox_height',
        'image_name',
        'image_width',
        'image_height'
    ].join(Settings.CSV_SEPARATOR);
}
