import RoleModel from "./role-model.js";

class UserModel {

    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role?: RoleModel; // 👈 השתמש ב-RoleModel כטיפוס
    updateStock: number;
    registrationDate: string = new Date().toISOString().slice(0, 10);
    constructor(user: UserModel) {
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
        } else {
            this.role = user.role;
        }

        this.updateStock = user.updateStock;
        this.registrationDate = user.registrationDate;
    }
}

export default UserModel;