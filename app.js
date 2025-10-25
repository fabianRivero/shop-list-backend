import "dotenv/config";
import mongoose from "mongoose";
import express from "express";
import morgan from "morgan";
import usersRoutes from "./routes/usersRoutes.js";
import itemsRoutes from "./routes/itemsRoutes.js";
import purchaseRoutes from './routes/purchaseRoutes.js';
import pendingRoutes from './routes/pendingRoutes.js';
import summaryRoutes from './routes/summaryRoutes.js';
import cors from 'cors';

const app = express();

const uri = process.env.NODE_ENV === "test" ?
  process.env.URI_TEST
  :
  process.env.URI

mongoose
  .connect(uri)
  .catch((err) => console.error("Failed to connect to MongoDB", err));

app.use(morgan("dev"));
app.use(express.json());

app.use(cors({
  origin: `${process.env.URL_PAGE}` || "http://localhost:5173/",
  credentials: true 
}));

app.use("/api/users", usersRoutes);
app.use("/api/items", itemsRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/pending-list', pendingRoutes);
app.use('/api/', summaryRoutes);

export default app;
