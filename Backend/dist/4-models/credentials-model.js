"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_errors_js_1 = require("./client-errors.js"); // הנתיב הנכון
const joi_1 = __importDefault(require("joi"));
class CredentialsModel {
    email;
    password;
    constructor(credentials) {
        this.email = credentials.email;
        this.password = credentials.password;
    }
    static validationSchema = joi_1.default.object({
        email: joi_1.default.string().required().min(10).max(50),
        password: joi_1.default.string().required().min(6).max(256)
    });
    validate() {
        const result = CredentialsModel.validationSchema.validate(this);
        if (result.error)
            throw new client_errors_js_1.ValidationError(result.error.message);
    }
}
exports.default = CredentialsModel;
