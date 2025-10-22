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
  month: { type: Number, required: true },  
  general: { type: Number, default: 0 }, 
  sectors: {
    type: [sectorBudgetSchema],
    default: []   
  }
}, { timestamps: true });

budgetSchema.index({ userId: 1, year: 1, month: 1 }, { unique: true });

export default mongoose.model("Budget", budgetSchema);
