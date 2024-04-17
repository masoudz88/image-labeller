import {LabelUtil} from "../../../utils/LabelUtil";
import {AnnotationImporter} from '../AnnotationImporter';
import {LabelsSelector} from '../../../store/selectors/LabelsSelector';

export class DocumentParsingError extends Error {
    constructor(message) {
        super(message);
        this.name = "DocumentParsingError";
    }
}

export class AnnotationAssertionError extends Error {
    constructor(message) {
        super(message);
        this.name = "AnnotationAssertionError";
    }
}

const parser = new DOMParser();

export class VOCImporter extends AnnotationImporter {
    import(filesData, onSuccess, onFailure) {
        try {
            const inputImagesData = VOCImporter.mapImageData();

            this.loadAndParseFiles(filesData).then(results => {
                for (const result of results.fileParseResults) {
                    if (inputImagesData[result.filename]) {
                        inputImagesData[result.filename].labelRects = result.labeledBoxes;
                    }
                }

                onSuccess(
                    Array.from(Object.values(inputImagesData)),
                    Array.from(Object.values(results.labelNames))
                );
            }).catch((error) => onFailure(error));
        } catch (error) {
            onFailure(error)
        }
    }

    loadAndParseFiles(files) {
        return Promise.all(files.map((file) => file.text())).then((fileTexts) => 
            fileTexts.reduce((current, fileText, currentIndex) => 
            {
                const fileName = files[currentIndex].name;
                try {
                    return VOCImporter.parseDocumentIntoImageData(VOCImporter.tryParseVOCDocument(fileText), current);
                } catch (e) {
                    if (e instanceof DocumentParsingError) {
                        throw new DocumentParsingError(`Failed trying to parse ${fileName} as VOC XML document.`)
                    } else if (e instanceof AnnotationAssertionError) {
                        throw new AnnotationAssertionError(`Failed trying to find required VOC annotations for ${fileName}.`)
                    } else {
                        throw e;
                    }
                }
            }, {
                labelNames: {},
                fileParseResults: []
            }));
    }

    static tryParseVOCDocument(fileText) {
        try {
            return parser.parseFromString(fileText, 'application/xml');
        } catch {
            throw new DocumentParsingError();
        }
    }

    static parseDocumentIntoImageData(
        document,
        {
            fileParseResults,
            labelNames
        }
    ) {
        try {
            const root = document.getElementsByTagName('annotation')[0];
            const filename = root.getElementsByTagName('filename')[0].textContent;
            const [labeledBoxes, newLabelNames] = this.parseAnnotationsFromFileString(document, labelNames);

            return {
                labelNames: newLabelNames,
                fileParseResults: fileParseResults.concat({
                    filename,
                    labeledBoxes
                }),
            };
        } catch {
            throw new AnnotationAssertionError();
        }
    }

    static parseAnnotationsFromFileString(document, labelNames) {
        const newLabelNames = Object.assign({}, labelNames);
        return [Array.from(document.getElementsByTagName('object')).map(d => {
            const labelName = d.getElementsByTagName('name')[0].textContent;
            const bbox = d.getElementsByTagName('bndbox')[0];
            const xmin = parseInt(bbox.getElementsByTagName('xmin')[0].textContent);
            const xmax = parseInt(bbox.getElementsByTagName('xmax')[0].textContent);
            const ymin = parseInt(bbox.getElementsByTagName('ymin')[0].textContent);
            const ymax = parseInt(bbox.getElementsByTagName('ymax')[0].textContent);
            const rect = {
                x: xmin,
                y: ymin,
                height: ymax - ymin,
                width: xmax - xmin, 
            };
            
            if (!newLabelNames[labelName]) {
                newLabelNames[labelName] = LabelUtil.createLabelName(labelName);
            }
            
            const labelId = newLabelNames[labelName].id;
            return LabelUtil.createLabelRect(labelId, rect);
        }), newLabelNames];
    }

    static mapImageData() {
        return LabelsSelector.getImagesData().reduce((imageDataMap, imageData) => {
            imageDataMap[imageData.fileData.name] = imageData;
            return imageDataMap;
        }, {});
    }
}
