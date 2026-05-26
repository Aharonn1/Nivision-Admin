"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_errors_js_1 = require("../4-models/client-errors.js");
const cyber_js_1 = __importDefault(require("../2-utils/cyber.js"));
async function verifyAdmin(request, response, next) {
    try {
        // Verify token - crash if not valid:
        const isAdmin = await cyber_js_1.default.verifyToken(request);
        if (!isAdmin) {
            next(new client_errors_js_1.AuthenticationError("you are not admin"));
        }
        // If valid - continue:
        next();
    }
    catch (err) {
        next(err);
    }
}
exports.default = verifyAdmin;
