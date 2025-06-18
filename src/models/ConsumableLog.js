import mongoose, { Schema, model, models } from 'mongoose';

const ConsumableLogSchema = new Schema(
  {
    stock_item: {
      type: Schema.Types.ObjectId,
      ref: 'ConsumableStock',
      required: true,
    },
    person_name: {
      type: String,
      required: true,
      default: 'Sarpras',
    },
    person_role: {
      type: String,
      default: 'Staff',
    },
    transaction_type: {
      type: String,
      enum: ['penambahan', 'pengambilan'],
      required: true,
    },
    quantity_changed: {
      type: Number,
      required: true,
    },
    notes: { // Untuk mencatat keperluan
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const ConsumableLog = models.ConsumableLog || model('ConsumableLog', ConsumableLogSchema);
export default ConsumableLog;
