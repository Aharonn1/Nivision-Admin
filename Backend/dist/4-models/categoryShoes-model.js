"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CategoryShoesModel {
    categoryId;
    categoryName;
    sale;
    constructor(category) {
        this.categoryId = category.categoryId;
        this.categoryName = category.categoryName;
        this.sale = category.sale;
    }
}
exports.default = CategoryShoesModel;
