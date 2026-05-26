"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UserModel {
    userId;
    firstName;
    lastName;
    email;
    password;
    role; // 👈 השתמש ב-RoleModel כטיפוס
    updateStock;
    registrationDate = new Date().toISOString().slice(0, 10);
    constructor(user) {
        this.userId = user.userId;
        this.firstName = user.firstName;
        this.lastName = user.lastName;
        this.email = user.email;
        this.password = user.password;
        // 🔑 התיקון האולטימטיבי: ודא ש-role הוא מספר או null/undefined
        // אם role מגיע כמחרוזת 'User' (או כל דבר אחר שאינו מספר)
        // וודא שהוא מאופס. 
        if (typeof user.role === 'string') {
            this.role = undefined; // או null
        }
        else {
            this.role = user.role;
        }
        this.updateStock = user.updateStock;
        this.registrationDate = user.registrationDate;
    }
}
exports.default = UserModel;
