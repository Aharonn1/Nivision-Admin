"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ImagesModel {
    imageId;
    imageName;
    constructor(image) {
        this.imageId = image.imageId;
        this.imageName = image.imageName;
    }
}
exports.default = ImagesModel;
