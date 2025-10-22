import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const itemSchema = new mongoose.Schema(
  {
    id: { type: String, default: uuidv4, required: true, unique: true },
    userId: { type: String, ref: "free-user", required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    price: { type: Number, required: true },
    brand: { type: String, default: "Sin especificar" },
    sector: { type: String, default: "other" },
  },
  {
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
        delete ret._id;
      },
      virtuals: true,
    },
  }
);

itemSchema.index({ id: 1, userId: 1 });

const ListItem = mongoose.model("Item", itemSchema);

export default ListItem;
