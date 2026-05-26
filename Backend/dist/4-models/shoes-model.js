"use strict";
// src/4-models/shoes-model.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShoesModel = void 0;
// המחלקה העיקרית (נשארת כפי שהייתה, יורשת מ-ShoeData)
class ShoesModel {
    shoesId;
    categoryId;
    title;
    description;
    price;
    bought;
    stock;
    image; // ✅ תיקון 2: הפוך את image לאופציונלי
    imageName;
    imageLink;
    shoppingBasket;
    favorite;
    imageNameFront;
    imageNameAbove;
    imageNameBack;
    imageNameDown;
    video;
    color;
    ai_description;
    constructor(shoes) {
        this.shoesId = shoes.shoesId;
        this.categoryId = shoes.categoryId;
        this.title = shoes.title;
        this.description = shoes.description;
        this.price = shoes.price;
        this.bought = shoes.bought;
        this.stock = shoes.stock;
        // ✅ תיקון 3: השתמש בנכס אופציונלי כדי להימנע משגיאת אתחול
        this.image = shoes.image;
        this.imageName = shoes.imageName;
        this.imageLink = shoes.imageLink;
        this.shoppingBasket = shoes.shoppingBasket;
        this.favorite = shoes.favorite;
        this.imageNameFront = shoes.imageNameFront;
        this.imageNameAbove = shoes.imageNameAbove;
        this.imageNameBack = shoes.imageNameBack;
        this.imageNameDown = shoes.imageNameDown;
        this.video = shoes.video;
        this.color = shoes.color;
        this.ai_description = shoes.ai_description;
    }
}
exports.ShoesModel = ShoesModel;
exports.default = ShoesModel;
