"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_service_js_1 = __importDefault(require("../5-services/auth-service.js"));
const user_model_js_1 = __importDefault(require("../4-models/user-model.js"));
const router = express_1.default.Router(); // Capital R
// POST http://localhost:4000/api/auth/register
router.post("/auth/register", async (request, response, next) => {
    try {
        const user = new user_model_js_1.default(request.body);
        console.log(user);
        const token = await auth_service_js_1.default.register(user);
        response.status(201).json(token);
    }
    catch (err) {
        next(err);
    }
});
