import mongoose, { Schema, model, models } from 'mongoose';

const LocationSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Nama lokasi tidak boleh kosong.'],
      trim: true,
    },
    building: {
      type: String,
      required: [true, 'Nama gedung tidak boleh kosong.'],
      trim: true,
    },
    floor: {
      type: String,
      required: [true, 'Lantai tidak boleh kosong.'],
      trim: true,
    },
    location_code: {
      type: String,
      unique: true,
      trim: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

LocationSchema.index({ name: 1, building: 1, floor: 1 }, { unique: true });

const Location = models.Location || model('Location', LocationSchema);
export default Location;
