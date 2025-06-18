import mongoose, { Schema, model, models } from 'mongoose';

const ConsumableStockSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    location: {
      type: Schema.Types.ObjectId,
      ref: 'Location',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    unit: {
      type: String,
      required: [true, 'Satuan tidak boleh kosong.'], // Contoh: Pcs, Box, Rim
    },
    reorder_point: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

ConsumableStockSchema.index({ product: 1, location: 1 }, { unique: true });

const ConsumableStock = models.ConsumableStock || model('ConsumableStock', ConsumableStockSchema);
export default ConsumableStock;
