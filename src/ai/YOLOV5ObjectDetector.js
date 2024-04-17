import { load } from 'yolov5js';
import {store} from '../index';
import {updateYOLOV5ObjectDetectorStatus} from '../store/ai/actionCreators';
import {updateActiveLabelType} from '../store/labels/actionCreators';
import {LabelType} from '../data/enums/LabelType';
import {NotificationUtil} from '../utils/NotificationUtil';
import {NotificationsDataMap} from '../data/info/NotificationsData';
import {Notification} from '../data/enums/Notification';
import {submitNewNotification} from '../store/notifications/actionCreators';
import {LabelsSelector} from '../store/selectors/LabelsSelector';
import {AIYOLOObjectDetectionActions} from '../logic/actions/AIYOLOObjectDetectionActions';
import {ImageRepository} from '../logic/imageRepository/ImageRepository';

export class YOLOV5ObjectDetector {
    static loadModel(modelConfig, onSuccess, onFailure) {
        const activeImageData = LabelsSelector.getActiveImageData();
        const image = ImageRepository.getById(activeImageData.id)
        YOLOV5ObjectDetector.loadModelSafely(modelConfig, image)
            .then((model) => {
                YOLOV5ObjectDetector.model = model;
                store.dispatch(updateYOLOV5ObjectDetectorStatus(true));
                store.dispatch(updateActiveLabelType(LabelType.RECT));
                const activeLabelType = LabelsSelector.getActiveLabelType();
                if (activeLabelType === LabelType.RECT) {
                    AIYOLOObjectDetectionActions.detectRectsForActiveImage();
                }
                if (onSuccess) onSuccess()
            })
            .catch((error) => {
                // tslint:disable-next-line:no-console
                console.log(error)
                if (onFailure) onFailure()
            })
    }

    static loadModelSafely(modelConfig, image) {
        return new Promise((resolve, reject) => {
            load(modelConfig, [640, 640])
                .then((model640) => {
                    model640.detect(image)
                        .then((detections) => resolve(model640))
                        .catch((error) => {
                            load(modelConfig, [1280, 1280])
                                .then((model1280) => {
                                    model1280.detect(image)
                                        .then((detections) => resolve(model1280))
                                        .catch(reject)
                                })
                                .catch(reject)
                        })
                })
                .catch(reject)
        });
    }

    static predict(image, callback) {
        if (!YOLOV5ObjectDetector.model) return;

        YOLOV5ObjectDetector.model
            .detect(image)
            .then((predictions) => {
                if (callback) {
                    callback(predictions)
                }
            })
            .catch((error) => {
                // tslint:disable-next-line:no-console
                console.log(error)
                // TODO: Introduce central logging system like Sentry
                store.dispatch(submitNewNotification(
                    NotificationUtil.createErrorNotification(NotificationsDataMap[Notification.MODEL_INFERENCE_ERROR])
                ))
            })
    }
}
