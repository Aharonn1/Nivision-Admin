// src/2-utils/file-utils.ts (הקוד המתוקן)

import fs from 'fs/promises';
import path from 'path';

const SRC_DIR = path.join(process.cwd(), "src", "1-assets", "images");
const DIST_DIR = path.join(process.cwd(), "dist", "1-assets", "images");

/**
 * מעתיק את כל התמונות מ-src ל-dist (אם הן לא קיימות כבר).
 */
export async function ensureAllAssetsCopied() {
    try {
        await fs.mkdir(DIST_DIR, { recursive: true });
        
        const files = await fs.readdir(SRC_DIR);
        
        for (const file of files) {
            const srcPath = path.join(SRC_DIR, file);
            const distPath = path.join(DIST_DIR, file);
            
            // ✅ נבדוק אם הקובץ קיים כבר ב-dist לפני העתקה (למקרה של כשל חלקי)
            if (path.extname(file) !== '.ts' && !path.extname(file).endsWith('.js')) {
                 if (!await fs.stat(distPath).catch(() => false)) {
                    await fs.copyFile(srcPath, distPath);
                    console.log(`[DEBUG: FILE_UTILS] ✅ הועתק: ${file} ל-DIST.`);
                 }
            }
        }
        
        console.log(`✔️ כל נכסי התמונות הועתקו ל-DIST.`);
    } catch (error) {
        console.error("CRITICAL ASSETS COPY ERROR:", error);
    }
}