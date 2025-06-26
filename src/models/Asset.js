import mongoose, { Schema, model, models } from 'mongoose';

const AssetSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    serial_number: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    location: {
      type: Schema.Types.ObjectId,
      ref: 'Location',
      required: true,
    },
    condition: {
      type: String,
      enum: ['Baik', 'Rusak', 'Kurang Baik'],
      default: 'Baik',
    },
    purchase_date: {
      type: String,
    },
    estimated_price: {
      type: Number,
    },
    attributes: {
      type: Schema.Types.Mixed, // Objek fleksibel untuk data tambahan
    },
  },
  { timestamps: true }
);

const Asset = models.Asset || model('Asset', AssetSchema);
export default Asset;
