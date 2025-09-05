// models/Budget.js
import mongoose from "mongoose";

const sectorBudgetSchema = new mongoose.Schema({
  sector: { type: String, required: true },
  budget: { type: Number, required: true, default: 0 },
  spent: { type: Number, required: true, default: 0 },
  isAuto: { type: Boolean, default: false }   
});

const budgetSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  year: { type: Number, required: true },
  month: { type: Number, required: true }, // 1-12
  general: { type: Number, default: 0 }, // Presupuesto general del mes
  sectors: {
    type: [sectorBudgetSchema],
    default: []   
  }
}, { timestamps: true });

// Evitar presupuestos duplicados para el mismo mes
budgetSchema.index({ userId: 1, year: 1, month: 1 }, { unique: true });

export default mongoose.model("Budget", budgetSchema);
