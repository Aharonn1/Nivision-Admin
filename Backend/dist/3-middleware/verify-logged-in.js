"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cyber_js_1 = __importDefault(require("../2-utils/cyber.js"));
async function verifyLoggedIn(request, response, next) {
    try {
        // Verify token - crash if not valid:
        await cyber_js_1.default.verifyToken(request);
        // If valid - continue:
        next();
    }
    catch (err) {
        next(err);
    }
}
exports.default = verifyLoggedIn;
