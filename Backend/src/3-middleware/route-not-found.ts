// import { RouteNotFoundError } from "../4-models/client-errors.js"; // זה הנתיב הנכון
// import { Request, Response, NextFunction } from "express";

// function routeNotFound(request: Request, response: Response, next: NextFunction): void {

//     // Create route-not-found error
//     const err = new RouteNotFoundError(request.originalUrl);

//     // Send to catch-all middleware:
//     next(err);

// }

// export default routeNotFound;


// 3-middleware/route-not-found.js

import path from "path"; 
import { Request, Response, NextFunction } from "express"; 

// שימוש ב-process.cwd() כדי לקבוע את השורש הגלובלי של הפרויקט
const routeNotFound = (request: Request, response: Response, next: NextFunction) => {
    
    // ✅ תיקון: שימוש בנתיב המלא שמצביע על תיקיית ה-assets בתוך dist
    const filePath = path.join(process.cwd(), "dist", "1-assets", "images", "pageNotFound.png");

    response.status(404).sendFile(filePath, err => {
        if (err) {
            // אם ה-404 נכשל, נחזיר שגיאת טקסט
            console.error("Failed to send 404 image:", err);
            response.status(404).send("הדף אינו קיים - 404");
        }
    });
};

export default routeNotFound;