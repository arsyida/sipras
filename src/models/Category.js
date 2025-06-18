import { Schema, model, models } from 'mongoose';

const CategorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Nama kategori tidak boleh kosong.'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const Category = models.Category || model('Category', CategorySchema);
export default Category;
