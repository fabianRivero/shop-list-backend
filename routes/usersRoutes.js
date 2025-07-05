import express from "express";
import { getUsers, login, signup } from "../controllers/userController.js";

const router = express.Router();

// GET /api/users/
router.get("/", getUsers);


// POST api/users/signup
router.post("/signup", signup);

// POST api/users/login
router.post("/login", login);

export default router;
