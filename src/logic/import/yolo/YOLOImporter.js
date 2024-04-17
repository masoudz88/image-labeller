import {AnnotationImporter} from '../AnnotationImporter';
import {FileUtil} from '../../../utils/FileUtil';
import {ArrayUtil} from '../../../utils/ArrayUtil';
import {NoLabelNamesFileProvidedError} from './YOLOErrors';
import {LabelsSelector} from '../../../store/selectors/LabelsSelector';
import {YOLOUtils} from './YOLOUtils';
import {ImageDataUtil} from '../../../utils/ImageDataUtil';
import {zip, find} from 'lodash';
import {ImageRepository} from '../../imageRepository/ImageRepository';

export class YOLOImporter extends AnnotationImporter {
    static labelsFileName = 'labels.txt';

    import(filesData, onSuccess, onFailure) {
        try {
            const sourceImagesData = LabelsSelector.getImagesData()
                .map((i) => ImageDataUtil.cleanAnnotations(i));
            const {labelNameFile, annotationFiles} = YOLOImporter.filterFilesData(filesData, sourceImagesData);
            const [relevantImageData, relevantAnnotations] = YOLOImporter
                .matchImagesWithAnnotations(sourceImagesData, annotationFiles);
            const labelNamesPromise = FileUtil.readFile(labelNameFile)
                .then((fileContent) => YOLOUtils.parseLabelsNamesFromString(fileContent));
            const missingImagesPromise = ImageDataUtil.loadMissingImages(relevantImageData);
            const annotationFilesPromise = FileUtil.readFiles(relevantAnnotations);
            Promise
                .all([labelNamesPromise, missingImagesPromise, annotationFilesPromise])
                .then((values) => {
                    const [labelNames, , annotationsRaw] = values;
                    const resultImageData = zip(relevantImageData, annotationsRaw)
                        .map((pair) => YOLOImporter.applyAnnotations(pair[0], pair[1], labelNames))
                    onSuccess(
                        YOLOImporter.injectImageDataWithAnnotations(sourceImagesData, resultImageData),
                        labelNames
                    );
                })
                .catch((error) => onFailure(error))
        } catch (error) {
            onFailure(error)
        }
    }

    static filterFilesData(filesData, imagesData) {
        const functionalityPartitionResult = ArrayUtil.partition(filesData, (i) => i.name === YOLOImporter.labelsFileName)
        if (functionalityPartitionResult.pass.length !== 1) {
            throw new NoLabelNamesFileProvidedError()
        }
        const imageIdentifiers = imagesData
            .map((i) => i.fileData.name)
            .map((i) => FileUtil.extractFileName(i))
        const matchingPartitionResult = ArrayUtil.partition(
            filesData,
            (i) => imageIdentifiers.includes(FileUtil.extractFileName(i.name))
        )
        return {
            labelNameFile: functionalityPartitionResult.pass[0],
            annotationFiles: matchingPartitionResult.pass
        }
    }

    static matchImagesWithAnnotations(images, annotations) {
        const predicate = (image, annotation) => {
            return FileUtil.extractFileName(image.fileData.name) === FileUtil.extractFileName(annotation.name);
        }
        return ArrayUtil.unzip(ArrayUtil.match(images, annotations, predicate));
    }

    static applyAnnotations(imageData, rawAnnotations, labelNames) {
        const image = ImageRepository.getById(imageData.id);
        imageData.labelRects = YOLOUtils.parseYOLOAnnotationsFromString(
            rawAnnotations,
            labelNames,
            {width: image.width, height: image.height},
            imageData.fileData.name
        );
        return imageData;
    }

    static injectImageDataWithAnnotations(sourceImageData, annotatedImageData) {
        return sourceImageData.map((i) => {
            const result = find(annotatedImageData, {id: i.id});
            return result ? result : i;
        });
    }
}
