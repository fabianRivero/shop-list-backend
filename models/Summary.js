import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const SummarySchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, required: true, unique: true },
  periodDate: { type: String, required: true },
  userId: { type: String, ref: 'free-user', required: true },
  sector: { type: String }, 
  stadistics: {
    type: Object,
    properties: {
      totalExpenses: { type: Number, default: 0 },
      sectorExpenses: { type: Object },
      totalBudget: { type: Number, default: 0 },
      sectorBudget: { type: Object },
    },
  },
});

SummarySchema.index({ userId: 1, id: 1 }, { unique: true });

const Summary = mongoose.model("Summary", SummarySchema);

export default Summary;