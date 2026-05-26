"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class shoesSizeModel {
    sizeId;
    shoesId;
    stock;
    constructor(size) {
        this.sizeId = size.sizeId;
        this.shoesId = size.shoesId;
        this.stock = size.stock;
    }
}
exports.default = shoesSizeModel;
