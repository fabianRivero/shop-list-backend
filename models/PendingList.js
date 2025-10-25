import mongoose from "mongoose";

const pendingLogSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  productId: { type: String, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  price: { type: Number, required: true },
  brand: { type: String, required: true },
  sector: { type: String,  required: true },
});

pendingLogSchema.index({ productId: 1 });

const pendingList = mongoose.model('PendingLog', pendingLogSchema);

export default pendingList;