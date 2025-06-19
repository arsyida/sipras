import mongoose, { Schema, model, models } from 'mongoose';

const ProductSchema = new Schema({
  product_code: {
    type: String,
    required: [true, 'Kode produk tidak boleh kosong.'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: [true, 'Nama produk tidak boleh kosong.'],
    trim: true,
  },
  brand: {
    type: String,
    trim: true,
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Kategori tidak boleh kosong.'],
  },
  measurement_unit: {
    type: String,
    enum: ['Pcs', 'Box', 'Rim', 'Kg', 'Lusin', 'Set', 'Susun'],
    required: [true, 'Satuan pengukuran tidak boleh kosong.'], // Contoh: Pcs, Box, Rim
    trim: true,
  },
});

ProductSchema.index({ name: 1, brand: 1 }, { unique: true });

const Product = models.Product || model('Product', ProductSchema);
export default Product;
