"use strict";
// import express, { Request, Response, NextFunction } from "express";
// import CategoryShoesModel from "../4-models/categoryShoes-model.js";
// import imageHandler from "../2-utils/image-handler.js";
// import shoesSizeModel from "../4-models/shoes-size.js";
// import CommentModel from "../4-models/commentModel.js";
// import UserModel from "../4-models/user-model.js";
// import ShoesModel from "../4-models/shoes-model.js";
// import OrderModel from "../4-models/orders.js";
// import tasksService from "../4-models/tasks-service.js";
// import { getInventoryAlerts } from "../getInventoryAlerts.js";
Object.defineProperty(exports, "__esModule", { value: true });
// const router = express.Router();
// router.get("/shoes", async (request: Request, response: Response, next: NextFunction) => {
//     try {
//         const shoes = await tasksService.getAllShoes();
//         response.json(shoes)
//     }
//     catch (err: any) {
//         next(err);
//     }
// });
// router.get("/shoesUsers/sizes", async (request: Request, response: Response, next: NextFunction) => {
//     try {
//         const shoes = await tasksService.getAllSizes();
//         response.json(shoes)
//     }
//     catch (err: any) {
//         next(err);
//     }
// });
// router.get("/shoesUsers1/:shoesId", async (request: Request, response: Response, next: NextFunction) => {
//     try {
//         const shoesId = +request.params.shoesId; // קבלת shoesId מהפרמטרים
//         const shoes = await tasksService.getAllShoesSizes(shoesId); // העברת shoesId לפונקציה
//         response.json(shoes);
//     }
//     catch (err: any) {
//         next(err);
//     }
// });
// router.get("/comments/:shoesId", async (request: Request, response: Response, next: NextFunction) => {
//     try {
//         const shoesId = +request.params.shoesId; // קבלת shoesId מהפרמטרים
//         const shoes = await tasksService.getAllComments(shoesId); // העברת shoesId לפונקציה
//         response.json(shoes);
//     }
//     catch (err: any) {
//         next(err);
//     }
// });
// router.get("/shoesUsers2/", async (request: Request, response: Response, next: NextFunction) => {
//     try {
//         const shoes = await tasksService.getAllShoesSizes1(); // העברת shoesId לפונקציה
//         response.json(shoes);
//     }
//     catch (err: any) {
//         next(err);
//     }
// });
// router.get("/favorite", async (request: Request, response: Response, next: NextFunction) => {
//     try {
//         const favorite = await tasksService.getAllFavorites();
//         response.json(favorite)
//     }
//     catch (err: any) {
//         next(err);
//     }
// });
// router.get("/favorite/:shoesId", async (request: Request, response: Response, next: NextFunction) => {
//     try {
//         const shoeId = parseInt(request.params.shoesId); // המרת מזהה הנעל למספר
//         const favorite = await tasksService.getFavoritesByShoeId(shoeId);
//         response.json(favorite);
//     } catch (err: any) {
//         next(err);
//     }
// });
// router.get("/graphs", async (request: Request, response: Response, next: NextFunction) => {
//     try {
//         const shoes = await tasksService.getAllOrdersAndShoesForAdmin();
//         response.json(shoes)
//     }
//     catch (err: any) {
//         next(err);
//     }
// });
// // router.post("/shoesUsers/:userId", async (request: Request, response: Response, next: NextFunction) => {
// //     try {
// //         const order = new OrderModel(request.body); // יצירת אובייקט הזמנה חדש
// //         await tasksService.buy(order); // העברת אובייקט ההזמנה בלבד
// //         response.status(201).send("ההזמנה התקבלה");
// //     } catch (err: any) {
// //         next(err);
// //     }
// // });
// router.post("/shoesUsers/:userId", async (request: Request, response: Response, next: NextFunction) => {
//     try {
//         const order = new OrderModel(request.body);
//         console.log(order);
//         const newOrder = await tasksService.buy1(order);
//         console.log(newOrder);
//         // 🏆 התיקון: Chain נכון לסטטוס ותוכן
//         return response.status(201).json(newOrder);
//     } catch (err: any) {
//         return next(err);
//     }
// });
// router.post("/categoryshoes", async (request: Request, response: Response, next: NextFunction) => {
//     try {
//         const category = new CategoryShoesModel(request.body);
//         const addCategory = await tasksService.addCategory(category);
//         response.status(210).json(addCategory);
//     }
//     catch (err: any) {
//         next(err)
//     }
// });
// router.post("/comments", async (request: Request, response: Response, next: NextFunction) => {
//     try {
//         const comment = new CommentModel(request.body);
//         const addedComment = await tasksService.addComment(comment);
//         response.status(201).json(addedComment);
//     } catch (err: any) {
//         next(err);
//     }
// });
// router.get("/shoesUsers", async (request: Request, response: Response, next: NextFunction) => {
//     try {
//         const shoes = await tasksService.getAllShoes();
//         response.json(shoes)
//     }
//     catch (err: any) {
//         next(err);
//     }
// });
// router.get("/users", async (request: Request, response: Response, next: NextFunction) => {
//     try {
//         const users = await tasksService.getAllUsers();
//         response.json(users)
//     }
//     catch (err: any) {
//         next(err);
//     }
// });
// router.get("/usersForAdmin", async (request: Request, response: Response, next: NextFunction) => {
//     try {
//         const users = await tasksService.getAllUsersForAdmin();
//         response.json(users)
//     }
//     catch (err: any) {
//         next(err);
//     }
// });
// router.delete("/usersForAdmin/:userId", async (request: Request, response: Response, next: NextFunction) => {
//     try {
//         const userId = +request.params.userId;
//         if (isNaN(userId)) {
//             return response.status(400).json({ message: "Invalid User ID provided." });
//         }
//         await tasksService.deleteUser(userId);
//         response.status(200).json({ message: `User ID ${userId} deleted successfully.` });
//     } catch (error: any) {
//         console.error(`❌ Error in DELETE /usersForAdmin/${request.params.userId}:`, error);
//         if (error.message.includes('לא נמצא')) { // Check for the specific error message if user not found
//             return response.status(404).json({ message: error.message }); // 404 Not Found if user doesn't exist
//         }
//         next(error);
//     }
// });
// router.get("/images", async (request: Request, response: Response, next: NextFunction) => {
//     try {
//         const images = await tasksService.getAllImages();
//         response.json(images)
//     }
//     catch (err: any) {
//         next(err);
//     }
// });
// router.get("/orders", async (request: Request, response: Response, next: NextFunction) => {
//     try {
//         const users = await tasksService.getAllOrders();
//         response.json(users)
//     }
//     catch (err: any) {
//         next(err);
//     }
// });
// router.get("/ordersPerMonth", async (request: Request, response: Response, next: NextFunction) => {
//     try {
//         const users = await tasksService.getAllOrdersPerMonth();
//         response.json(users)
//     }
//     catch (err: any) {
//         next(err);
//     }
// });
// router.get("/categoryshoes", async (request: Request, response: Response, next: NextFunction) => {
//     try {
//         const shoes = await tasksService.getAllCategories();
//         response.json(shoes)
//     }
//     catch (err: any) {
//         next(err);
//     }
// });
// router.get("/mySupply", async (request: Request, response: Response, next: NextFunction) => {
//     try {
//         const shoes = await tasksService.getAllMySupply();
//         response.json(shoes)
//     }
//     catch (err: any) {
//         next(err);
//     }
// });
// router.get("/repeatOrders", async (request: Request, response: Response, next: NextFunction) => {
//     try {
//         const shoes = await tasksService.getAllCancelOrders();
//         response.json(shoes)
//     }
//     catch (err: any) {
//         next(err);
//     }
// });
// router.get("/shoes-per-category/:categoryId", async (request: Request, response: Response, next: NextFunction) => {
//     try {
//         const categoryId = +request.params.categoryId;
//         const category = await tasksService.getShoesByCategory(categoryId);
//         response.json(category)
//     } catch (err: any) {
//         next(err)
//     }
// })
// router.get('/myFavorites/:userId', async (request: Request, response: Response) => {
//     try {
//         const userId = +request.params.userId;
//         const favorites = await tasksService.getAllFavoritesByUser(userId);
//         response.json(favorites);
//     } catch (error) {
//         console.error("שגיאה:", error);
//         response.status(500).send('שגיאה בשרת');
//     }
// });
// router.get("/shoesUsers/:shoesId", async (request: Request, response: Response, next: NextFunction) => {
//     try {
//         const shoesId = +request.params.shoesId;
//         const category = await tasksService.getOneProduct(shoesId);
//         console.log(category)
//         response.json(category)
//     } catch (err: any) {
//         next(err)
//     }
// })
// router.get("/ordersUsers/:userId", async (request: Request, response: Response, next: NextFunction) => {
//     try {
//         const userId = +request.params.userId;
//         const category = await tasksService.getAllOrdersAndShoesOfUser(userId);
//         response.json(category)
//     } catch (err: any) {
//         next(err)
//     }
// })
// router.get("/ordersUsers3/:userId", async (request: Request, response: Response, next: NextFunction) => {
//     try {
//         const userId = +request.params.userId;
//         const category = await tasksService.getAllOrdersAndShoesOfUser3(userId);
//         response.json(category)
//     } catch (err: any) {
//         next(err)
//     }
// })
// router.put("/ordersUsers/:userId", async (request: Request, response: Response, next: NextFunction) => {
//     try {
//         const userId = +request.params.userId;
//         const ordersToUpdate = request.body;
//         if (!Array.isArray(ordersToUpdate)) {
//             return response.status(400).json({ message: "Invalid request body. Expected an array of orders." });
//         }
//         for (const order of ordersToUpdate) {
//             if (!order.orderId) {
//                 return response.status(400).json({ message: "Invalid request body. Each order must have an orderId." });
//             }
//         }
//         await tasksService.updateOrdersStatusToOne(ordersToUpdate, userId);
//         response.json({ message: "Order statuses updated successfully." });
//     } catch (error) {
//         next(error);
//     }
// });
// router.put("/mySupply/", async (request: Request, response: Response, next: NextFunction) => {
//     try {
//         const shoeSizeData: shoesSizeModel = request.body;
//         if (!shoeSizeData || typeof shoeSizeData.shoesId !== 'number' || typeof shoeSizeData.sizeId !== 'number' || typeof shoeSizeData.stock !== 'number' || shoeSizeData.stock < 0) {
//             return response.status(400).json({ message: "Invalid request data. Expected shoesId (number), sizeId (number), and stock (non-negative number)." });
//         }
//         await tasksService.updateShoeSizeStock(shoeSizeData);
//         response.status(200).json({ message: "מלאי המידה עודכן בהצלחה." });
//     } catch (error: any) {
//         console.error("שגיאה בראוטר PUT /mySupply/:", error);
//         if (error.message.includes('לא נמצאה לעדכון')) {
//             return response.status(404).json({ message: error.message });
//         }
//         next(error);
//     }
// });
// router.get("/clothing-per-category/:categoryId", async (request: Request, response: Response, next: NextFunction) => {
//     try {
//         const categoryId = +request.params.categoryId;
//         const category = await tasksService.getShoesByCategory(categoryId);
//         response.json(category)
//     } catch (err: any) {
//         next(err)
//     }
// })
// router.get("/shoesUsers/images/:imageName", async (request: Request, response: Response, next: NextFunction) => {
//     try {
//         const imageName = request.params.imageName;
//         const absolutePath = imageHandler.getAbsolutePath(imageName);
//         response.sendFile(absolutePath);
//     } catch (err: any) {
//         next(err);
//     }
// });
// router.post("/shoes", async (request: Request, response: Response, next: NextFunction) => {
//     try {
//         request.body.image = request.files?.image;
//         const shoes = new ShoesModel(request.body);
//         const addedShoes = await tasksService.addShoes(shoes);
//         response.status(210).json(addedShoes);
//     }
//     catch (err: any) {
//         next(err);
//     }
// });
// router.delete("/categoryshoes/:categoryId([0-9]+)", async (request: Request, response: Response, next: NextFunction) => {
//     try {
//         const categoryId = +request.params.categoryId;
//         await tasksService.deleteCategory(categoryId);
//         response.sendStatus(204)
//     } catch (err: any) {
//         next(err)
//     }
// })
// router.delete("/shoesUsers/:orderId([0-9]+)", async (request: Request, response, next: NextFunction) => {
//     try {
//         const orderId = +request.params.orderId;
//         console.log("orderId ", orderId)
//         await tasksService.deleteOrder(orderId);
//         response.sendStatus(204)
//     } catch (err: any) {
//         next(err)
//     }
// });
// router.delete("/shoesUsers1/:orderId([0-9]+)", async (request: Request, response, next: NextFunction) => {
//     try {
//         const orderId = +request.params.orderId;
//         console.log("orderId ", orderId)
//         await tasksService.deleteOrder1(orderId);
//         response.sendStatus(204)
//     } catch (err: any) {
//         next(err)
//     }
// });
// router.put("/categoryshoes/:categoryId([0-9]+)", async (request: Request, response: Response, next: NextFunction) => {
//     try {
//         request.body.categoryId = +request.params.categoryId;
//         const category = new CategoryShoesModel(request.body);
//         const updateCategory = await tasksService.updateCategory(category);
//         response.json(updateCategory);
//     }
//     catch (err: any) {
//         next(err);
//     }
// });
// router.put("/ordersUsers/:userId/:orderId([0-9]+)", async (request: Request, response: Response, next: NextFunction) => {
//     try {
//         const userId = +request.params.userId;
//         const orderId = +request.params.orderId;
//         const comment = request.body.comment;
//         const updatedOrder = await tasksService.updateOrderStatus2(orderId, userId, comment);
//         response.json(updatedOrder);
//     } catch (error) {
//         console.error("ERROR (Backend Route): Uncaught error during order status update:", error);
//         next(error);
//     }
// });
// router.put("/creditCardForm/:userId/:orderId([0-9]+)", async (request: Request, response: Response, next: NextFunction) => {
//     try {
//         const userId = +request.params.userId;
//         const orderId = +request.params.orderId;
//         const userExperience = +request.body.userExperience;
//         const userCommentExperience = request.body.userCommentExperience;
//         const updatedOrder = await tasksService.updateUserExperience(orderId, userId, userExperience, userCommentExperience);
//         response.json(updatedOrder)
//     } catch (error) {
//         console.error("ERROR (Backend Route): Uncaught error during order status update:", error);
//         next(error);
//     }
// });
// router.put("/mySales/:shoesId([0-9]+)", async (request: Request, response: Response, next: NextFunction) => {
//     try {
//         request.body.shoesId = +request.params.shoesId;
//         const shoes = new ShoesModel(request.body);
//         const updatePrice = await tasksService.updatePrice(shoes);
//         response.json(updatePrice);
//     }
//     catch (err: any) {
//         next(err);
//     }
// });
// router.put("/orders/:orderId([0-9]+)", async (request: Request, response: Response, next: NextFunction) => {
//     try {
//         request.body.orderId = +request.params.orderId;
//         const order = new OrderModel(request.body);
//         const updateOrder = await tasksService.buyOrder(order);
//         response.json(updateOrder);
//     }
//     catch (err: any) {
//         next(err);
//     }
// });
// router.put("/myAccount/:userId([0-9]+)", async (request: Request, response: Response, next: NextFunction) => {
//     try {
//         request.body.userId = +request.params.userId;
//         const user = new UserModel(request.body);
//         console.log(user)
//         const updateUser = await tasksService.getUserAccount(user);
//         response.json(updateUser);
//     }
//     catch (err: any) {
//         next(err);
//     }
// });
// router.put("/shoes/:shoesId([0-9]+)", async (request: Request, response: Response, next: NextFunction) => {
//     try {
//         request.body.shoesId = +request.params.shoesId;
//         const shoes = new ShoesModel(request.body);
//         const updateProduct = await tasksService.updateProduct(shoes);
//         response.json(updateProduct);
//     }
//     catch (err: any) {
//         next(err);
//     }
// });
// router.get("/categoryshoes/:categoryId([0-9]+)", async (request: Request, response: Response, next: NextFunction) => {
//     try {
//         const categoryId = +request.params.categoryId;
//         const category = await tasksService.getOneCategory(categoryId);
//         response.json(category)
//     } catch (err: any) {
//         next(err)
//     }
// })
// router.post("/shoesUsers/favorite/:shoesId", async (request: Request, response: Response, next: NextFunction) => {
//     try {
//         const shoesId = +request.params.shoesId;
//         // ✅ תיקון קריטי: קוראים את userId ישירות מה-Body
//         const userId = +request.body.userId;
//         await tasksService.favorite(userId, shoesId);
//         response.sendStatus(200);
//     } catch (err: any) {
//         next(err);
//     }
// });
// router.delete("/shoesUsers/favorite/:shoesId", async (request: Request, response: Response, next: NextFunction) => {
//     try {
//         const shoesId = +request.params.shoesId;
//         // ✅ תיקון קריטי: קוראים את userId ישירות מה-Body גם עבור DELETE
//         const userId = +request.body.userId;
//         await tasksService.unfavorite(userId, shoesId);
//         response.sendStatus(204); // 204 No Content הוא קוד תקין למחיקה
//     } catch (err: any) {
//         next(err);
//     }
// });
// export default router;
