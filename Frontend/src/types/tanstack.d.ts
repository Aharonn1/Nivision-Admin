/**
 * קובץ זה מגדיר טיפוסיים גלובליים עבור TanStack Router.
 * הוא חיוני כדי לאפשר ל-TypeScript לאמת את השימוש בפונקציות כמו
 * useParams, useRouteContext, ו-register של TanStack Form.
 */
import { RouteGenerics } from "@tanstack/react-router";

// הגדרה כללית של הטיפוסים
declare module "@tanstack/react-router" {
  // הרחבת המודול הגלובלי של TanStack Router
  interface Register {
    // הטיפוס הזה הוא המפתח שמאפשר ל-TanStack "לדעת" את הטיפוסים של הרואטר
    // אם לא נספק את הטיפוס הזה, הקומפיילר לא יוכל להבין את הנתונים
    router: typeof Router; 
  }
}

// **הערה חשובה:**
// הטיפוסים הספציפיים בפנים חייבים להיות מוגדרים על ידי הקוד שלך.
// מאחר שאין לי גישה למבנה הרואטר המלא שלך, 
// אנו משתמשים בהגדרה פשוטה כדי לאפשר למהדר להתקדם.
// אם השגיאות עדיין קיימות, תצטרך להוסיף כאן הגדרות ספציפיות יותר.

// דוגמה לטיפוס גלובלי עבור Form/Register (אם אתה משתמש ב-TanStack Form)
// אם אתה משתמש ב-TanStack Form, לעתים קרובות תצטרך להגדיר את FormApi
declare module "@tanstack/react-form" {
  interface Register {
    // כאן נרשמים הטיפוסים הספציפיים של כל FormApi
    // דוגמה: formApi: FormApi<MyFormValues> 
  }
}