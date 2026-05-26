"use strict";
// src/2-utils/image-handler.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = __importDefault(require("fs/promises"));
const uuid_1 = require("uuid");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// ✅ 1. הנתיב שבו נשמרים קבצים חדשים (במצב פיתוח, זה יכניס אותם ל-src)
const SAVE_PATH = path_1.default.join(process.cwd(), "src", "1-assets", "images");
// ✅ 2. הנתיב ממנו מוגשים קבצים (במצב build, זה dist). זהו ה-SERVE_PATH.
const SERVE_PATH = path_1.default.join(process.cwd(), "dist", "1-assets", "images");
function createImageName(originalImageName) {
    const extension = originalImageName.substring(originalImageName.lastIndexOf("."));
    return (0, uuid_1.v4)() + extension;
}
/**
 * שומר תמונה לתיקיית Assets ב-src.
 */
async function saveImage(image) {
    const uniqueImageName = createImageName(image.name);
    // ✅ שמירה לנתיב ה-src/
    const absolutePath = path_1.default.join(SAVE_PATH, uniqueImageName);
    if (!fs_1.default.existsSync(SAVE_PATH)) {
        await promises_1.default.mkdir(SAVE_PATH, { recursive: true });
    }
    await image.mv(absolutePath);
    return uniqueImageName;
}
// Update existing image:
async function updateImage(image, existingImageName) {
    await deleteImage(existingImageName);
    const uniqueImageName = await saveImage(image);
    return uniqueImageName;
}
// Delete existing image:
async function deleteImage(existingImageName) {
    try {
        if (!existingImageName)
            return;
        // ✅ מחיקה מהנתיב האבסולוטי של src (מקום השמירה)
        await promises_1.default.unlink(path_1.default.join(SAVE_PATH, existingImageName));
    }
    catch (err) {
        if (err.code !== 'ENOENT') {
            console.log(err.message);
        }
    }
}
/**
 * מחזיר את הנתיב האבסולוטי של התמונה, לקריאה מ-dist.
 */
function getAbsolutePath(imageName) {
    // ✅ קריאה מהנתיב ה-dist/
    console.log(`[DEBUG: IMAGE_HANDLER] מחפש תמונה: ${imageName}`);
    let absolutePath = path_1.default.join(SERVE_PATH, imageName);
    if (!fs_1.default.existsSync(absolutePath)) {
        // אם לא נמצא, נחזיר את 404
        console.warn(`[WARNING: IMAGE_HANDLER] ❌ תמונה לא נמצאה בנתיב: ${absolutePath}`);
        absolutePath = path_1.default.join(SERVE_PATH, "pageNotFound.png");
        console.log(`[DEBUG: IMAGE_HANDLER] 💡 מחזיר 404 מנתיב: ${absolutePath}`);
    }
    return absolutePath;
}
exports.default = {
    saveImage,
    updateImage,
    deleteImage,
    getAbsolutePath
};
