import express, { Request, Response, NextFunction } from "express";
import authService from "../5-services/auth-service.js";
import UserModel from "../4-models/user-model.js";
const router = express.Router(); // Capital R

// POST http://localhost:4000/api/auth/register
router.post("/auth/register", async (request: Request, response: Response, next: NextFunction) => {
    try {
        const user = new UserModel(request.body);
        console.log(user)
        const token = await authService.register(user);
        response.status(201).json(token);
    }
    catch (err: any) {
        next(err);
    }
})

