"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FavoriteModel {
    userId;
    shoesId;
    constructor(favorite) {
        this.userId = favorite.userId;
        this.shoesId = favorite.shoesId;
    }
}
exports.default = FavoriteModel;
