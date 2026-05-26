// src/2-utils/image-handler.ts

import { UploadedFile } from "express-fileupload";
import fsPromises from "fs/promises";
import { v4 as uuid } from "uuid";
import path from "path";
import fs from "fs";

// ✅ 1. הנתיב שבו נשמרים קבצים חדשים (במצב פיתוח, זה יכניס אותם ל-src)
const SAVE_PATH = path.join(process.cwd(), "src", "1-assets", "images");

// ✅ 2. הנתיב ממנו מוגשים קבצים (במצב build, זה dist). זהו ה-SERVE_PATH.
const SERVE_PATH = path.join(process.cwd(), "dist", "1-assets", "images");


function createImageName(originalImageName: string): string {
    const extension = originalImageName.substring(originalImageName.lastIndexOf("."));
    return uuid() + extension;
}

/**
 * שומר תמונה לתיקיית Assets ב-src.
 */
async function saveImage(image: UploadedFile): Promise<string> {
    const uniqueImageName = createImageName(image.name);
    // ✅ שמירה לנתיב ה-src/
    const absolutePath = path.join(SAVE_PATH, uniqueImageName); 

    if (!fs.existsSync(SAVE_PATH)) { await fsPromises.mkdir(SAVE_PATH, { recursive: true }); }

    await image.mv(absolutePath);
    return uniqueImageName;
}

// Update existing image:
async function updateImage(image: UploadedFile, existingImageName: string): Promise<string> {
    await deleteImage(existingImageName);
    const uniqueImageName = await saveImage(image);
    return uniqueImageName;
}

// Delete existing image:
async function deleteImage(existingImageName: string): Promise<void> {
    try {
        if (!existingImageName) return;
        // ✅ מחיקה מהנתיב האבסולוטי של src (מקום השמירה)
        await fsPromises.unlink(path.join(SAVE_PATH, existingImageName));
    }
    catch (err: any) {
        if (err.code !== 'ENOENT') {
             console.log(err.message);
        }
    }
}

/**
 * מחזיר את הנתיב האבסולוטי של התמונה, לקריאה מ-dist.
 */
function getAbsolutePath(imageName: string): string {
    // ✅ קריאה מהנתיב ה-dist/

    console.log(`[DEBUG: IMAGE_HANDLER] מחפש תמונה: ${imageName}`);
    let absolutePath = path.join(SERVE_PATH, imageName);
    
    if (!fs.existsSync(absolutePath)) {
        // אם לא נמצא, נחזיר את 404
        console.warn(`[WARNING: IMAGE_HANDLER] ❌ תמונה לא נמצאה בנתיב: ${absolutePath}`);
        absolutePath = path.join(SERVE_PATH, "pageNotFound.png");
        console.log(`[DEBUG: IMAGE_HANDLER] 💡 מחזיר 404 מנתיב: ${absolutePath}`);
    }
    return absolutePath;
}

export default {
    saveImage,
    updateImage,
    deleteImage,
    getAbsolutePath
};