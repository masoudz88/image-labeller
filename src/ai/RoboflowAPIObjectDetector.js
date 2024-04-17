import axios from 'axios';
import { FileUtil } from '../utils/FileUtil';
import { store } from '../index';
import { updateRoboflowAPIDetails } from '../store/ai/actionCreators';
import { updateActiveLabelType } from '../store/labels/actionCreators';
import { LabelType } from '../data/enums/LabelType';
import { LabelsSelector } from '../store/selectors/LabelsSelector';
import { AISelector } from '../store/selectors/AISelector';

export class RoboflowAPIObjectDetector {

    static loadModel(roboflowAPIDetails, onSuccess, onFailure) {
        store.dispatch(updateRoboflowAPIDetails(roboflowAPIDetails));
        store.dispatch(updateActiveLabelType(LabelType.RECT));
        const activeLabelType = LabelsSelector.getActiveLabelType();
        if (activeLabelType === LabelType.RECT) {
            const activeImageData = LabelsSelector.getActiveImageData();

            const wrappedOnFailure = () => {
                store.dispatch(updateRoboflowAPIDetails({status: false, model: '', key: ''}));
                onFailure()
            }

            RoboflowAPIObjectDetector.predict(activeImageData, onSuccess, wrappedOnFailure)
        }
    }

    static predict(imageData, onSuccess, onFailure) {
        const roboflowAPIDetails = AISelector.getRoboflowAPIDetails();
        FileUtil.loadImageBase64(imageData.fileData).then((data) => {
            axios({
                method: 'POST',
                url: 'https://detect.roboflow.com/' + roboflowAPIDetails.model,
                params: {
                    api_key: roboflowAPIDetails.key
                },
                data,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
                .then((response) => {
                    const predictions = (response.data.predictions)
                        .map((prediction) => {
                            return {
                                x: prediction.x - prediction.width / 2,
                                y: prediction.y - prediction.height /2,
                                width: prediction.width,
                                height: prediction.height,
                                score: prediction.confidence,
                                class: prediction.class
                            }
                        });
                    onSuccess(predictions)
                })
                .catch(onFailure)
        })
    }
}