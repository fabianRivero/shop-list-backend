import "dotenv/config";
import mongoose from "mongoose";
import express from "express";
import morgan from "morgan";
import usersRoutes from "./routes/usersRoutes.js";
import itemsRoutes from "./routes/itemsRoutes.js";
import purchaseRoutes from './routes/purchaseRoutes.js';
import summaryRoutes from './routes/summaryRoutes.js';
import cors from 'cors';

const app = express();

const DB_URL =
  process.env.NODE_ENV === "test"
    ? "mongodb://localhost:27017/shop-list-test"
    : process.env.DB_URL || "mongodb://localhost:27017/shop-list";

mongoose
  .connect(DB_URL)
  .then(() => console.log(`Connected to DB: ${DB_URL}`))
  .catch((err) => console.error("Failed to connect to MongoDB", err));

app.use(morgan("dev"));
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true 
}));

app.use("/api/users", usersRoutes);
app.use("/api/items", itemsRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/', summaryRoutes);

export default app;
