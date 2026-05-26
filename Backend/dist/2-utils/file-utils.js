"use strict";
// src/2-utils/file-utils.ts (הקוד המתוקן)
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureAllAssetsCopied = ensureAllAssetsCopied;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const SRC_DIR = path_1.default.join(process.cwd(), "src", "1-assets", "images");
const DIST_DIR = path_1.default.join(process.cwd(), "dist", "1-assets", "images");
/**
 * מעתיק את כל התמונות מ-src ל-dist (אם הן לא קיימות כבר).
 */
async function ensureAllAssetsCopied() {
    try {
        await promises_1.default.mkdir(DIST_DIR, { recursive: true });
        const files = await promises_1.default.readdir(SRC_DIR);
        for (const file of files) {
            const srcPath = path_1.default.join(SRC_DIR, file);
            const distPath = path_1.default.join(DIST_DIR, file);
            // ✅ נבדוק אם הקובץ קיים כבר ב-dist לפני העתקה (למקרה של כשל חלקי)
            if (path_1.default.extname(file) !== '.ts' && !path_1.default.extname(file).endsWith('.js')) {
                if (!await promises_1.default.stat(distPath).catch(() => false)) {
                    await promises_1.default.copyFile(srcPath, distPath);
                    console.log(`[DEBUG: FILE_UTILS] ✅ הועתק: ${file} ל-DIST.`);
                }
            }
        }
        console.log(`✔️ כל נכסי התמונות הועתקו ל-DIST.`);
    }
    catch (error) {
        console.error("CRITICAL ASSETS COPY ERROR:", error);
    }
}
