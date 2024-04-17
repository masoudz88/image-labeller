export let Notification;

(function(Notification) {
    Notification[Notification["EMPTY_LABEL_NAME_ERROR"] = 0] = "EMPTY_LABEL_NAME_ERROR";
    Notification[Notification["NON_UNIQUE_LABEL_NAMES_ERROR"] = 1] = "NON_UNIQUE_LABEL_NAMES_ERROR";
    Notification[Notification["MODEL_DOWNLOAD_ERROR"] = 2] = "MODEL_DOWNLOAD_ERROR";
    Notification[Notification["MODEL_INFERENCE_ERROR"] = 3] = "MODEL_INFERENCE_ERROR";
    Notification[Notification["MODEL_LOAD_ERROR"] = 4] = "MODEL_LOAD_ERROR";
    Notification[Notification["LABELS_FILE_UPLOAD_ERROR"] = 5] = "LABELS_FILE_UPLOAD_ERROR";
    Notification[Notification["ANNOTATION_FILE_PARSE_ERROR"] = 6] = "ANNOTATION_FILE_PARSE_ERROR";
    Notification[Notification["ANNOTATION_IMPORT_ASSERTION_ERROR"] = 7] = "ANNOTATION_IMPORT_ASSERTION_ERROR";
    Notification[Notification["UNSUPPORTED_INFERENCE_SERVER_MESSAGE"] = 8] = "UNSUPPORTED_INFERENCE_SERVER_MESSAGE";
    Notification[Notification["ROBOFLOW_INFERENCE_SERVER_ERROR"] = 9] = "ROBOFLOW_INFERENCE_SERVER_ERROR";
})(Notification || (Notification = {}));
