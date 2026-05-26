"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["Pending"] = "Pending";
    OrderStatus["Completed"] = "Completed";
})(OrderStatus || (OrderStatus = {}));
class OrderModel {
    orderId;
    sizeId;
    userId;
    shoesId;
    quantity;
    status;
    sale;
    comment;
    userExperience;
    userCommentExperience;
    orderStatus = OrderStatus.Pending; // הוספת המשתנה החדש
    orderDate = new Date().toISOString().slice(0, 10);
    constructor(order) {
        this.orderId = order.orderId;
        this.sizeId = order.sizeId;
        this.userId = order.userId;
        this.shoesId = order.shoesId;
        this.quantity = order.quantity;
        this.status = order.status;
        this.sale = order.sale;
        this.comment = order.comment;
        this.userExperience = order.userExperience;
        this.userCommentExperience = order.userCommentExperience;
        this.orderStatus = order.orderStatus; // הוספת המשתנה החדש
        this.orderDate = order.orderDate;
    }
}
exports.default = OrderModel;
