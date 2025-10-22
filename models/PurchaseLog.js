import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const purchaseLogSchema = new mongoose.Schema({
  userId: { type: String, ref: 'free-user', required: true },
  date: { type: Date, required: true },
  purchases: [
    {
      productId: { type: String, required: true },
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      purchaseQuantity: { type: Number, required: true },
      unit: { type: String, required: true },
      price: { type: Number, required: true },
      brand: { type: String },
      sector: { type: String, default: 'other' },
      purchaseId: { type: String, default: uuidv4, required: true },

    }
  ]
});

purchaseLogSchema.index({ userId: 1, date: 1 });

const PurchaseLog = mongoose.model('PurchaseLog', purchaseLogSchema);

export default PurchaseLog;