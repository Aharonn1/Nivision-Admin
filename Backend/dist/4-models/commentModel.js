"use strict";
// src/4-models/commentModel.ts
Object.defineProperty(exports, "__esModule", { value: true });
class CommentModel {
    commentId; // הפוך ללא-חובה
    userId;
    shoesId;
    commentText;
    commentDate; // אל תאתחל כאן
    constructor(commentModel) {
        this.commentId = commentModel.commentId;
        this.userId = commentModel.userId;
        this.shoesId = commentModel.shoesId;
        this.commentText = commentModel.commentText;
        // הגדרת תאריך אוטומטית רק אם הוא לא סופק:
        if (commentModel.commentDate) {
            this.commentDate = commentModel.commentDate;
        }
        else {
            this.commentDate = new Date().toISOString().slice(0, 10);
        }
    }
}
exports.default = CommentModel;
