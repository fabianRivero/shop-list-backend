import express from "express";
import { deleteUser, getUser, getUsers, login, signup, updateUser } from "../controllers/userController.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.get("/", getUsers);

router.get("/:id", getUser);

router.post("/signup", signup);

router.post("/login", login);

router.delete("/delete", [auth], deleteUser);

router.put("/update", [auth], updateUser);

export default router;
