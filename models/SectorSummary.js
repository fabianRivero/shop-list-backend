import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const sectorSummarySchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, required: true, unique: true },
  userId: { type: String, ref: 'free-user', required: true },
  sector: { type: String, required: true }, // ejemplo: "alimentos"
  periodKey: {
    type: String,
    required: true,
    match: [/^\d{4}-(\d{2}|W\d{1,2}|\d{2}-\d{2})$/, 'Invalid periodKey format'], 
  },
  totalSpent: { type: Number, default: 0 },
  budget: { type: Number }, // opcional: límite de gasto asignado
  isDeleted: { type: Boolean, default: false },
  items: [{
    productId: String,
    name: String,
    quantity: Number,
    purchasedQuantity: Number,
    unit: String,
    price: Number,
    currency: String,
    brand: String,
    sector: String 
  }]
});

sectorSummarySchema.index({ userId: 1, sector: 1, periodKey: 1 }, { unique: true });

const SectorSummary = mongoose.model("SectorSummary", sectorSummarySchema);

export default SectorSummary;