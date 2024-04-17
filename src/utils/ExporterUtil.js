import moment from 'moment';
import {GeneralSelector} from '../store/selectors/GeneralSelector';
import {saveAs} from 'file-saver';

export class ExporterUtil {
    static getExportFileName() {
        const projectName = GeneralSelector.getProjectName();
        const date = moment().format('YYYY-MM-DD-hh-mm-ss');
        return `labels_${projectName}_${date}`
    }

    static saveAs(content, fileName) {
        const blob = new Blob([content], {type: 'text/plain;charset=utf-8'});
        try {
            saveAs(blob, fileName);
        } catch (error) {
            // TODO: Implement file save error handling
            throw new Error(error);
        }
    }
}
