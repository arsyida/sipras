/**
 * @file Mendefinisikan skema dan model Mongoose untuk 'Product'.
 * Skema ini merepresentasikan data produk atau barang inventaris.
 */

import mongoose, { Schema, model, models } from 'mongoose';

/**
 * @schema ProductSchema
 * @description Skema Mongoose untuk data produk.
 */
const ProductSchema = new Schema({
  /**
   * @property {string} product_code - Kode unik internal untuk produk.
   * @property {boolean} required - Kode produk wajib diisi.
   * @property {boolean} uppercase - Mengonversi kode produk menjadi huruf besar secara otomatis.
   * @property {boolean} trim - Menghapus spasi di awal dan akhir.
   */
  product_code: {
    type: String,
    required: [true, 'Kode produk tidak boleh kosong.'],
    uppercase: true,
    trim: true,
  },
  /**
   * @property {string} name - Nama dari produk.
   * @property {boolean} required - Nama produk wajib diisi.
   * @property {boolean} trim - Menghapus spasi di awal dan akhir.
   */
  name: {
    type: String,
    required: [true, 'Nama produk tidak boleh kosong.'],
    trim: true,
  },
  /**
   * @property {mongoose.Schema.Types.ObjectId} brand - Referensi ke model 'Brand'.
   * @property {boolean} required - Setiap produk harus memiliki brand.
   */
  brand: {
    type: Schema.Types.ObjectId,
    ref: 'Brand',
    required: [true, 'Brand tidak boleh kosong.'], 
  },
  /**
   * @property {mongoose.Schema.Types.ObjectId} category - Referensi ke model 'Category'.
   * @property {boolean} required - Setiap produk harus memiliki kategori.
   */
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Kategori tidak boleh kosong.'],
  },
  /**
   * @property {string} measurement_unit - Satuan ukur untuk produk.
   * @property {Array<string>} enum - Nilai yang diperbolehkan untuk satuan ukur.
   * @property {boolean} required - Satuan ukur wajib diisi.
   */
  measurement_unit: {
    type: String,
    enum: ['Pcs', 'Meter', 'Susun', 'Set'],
    required: [true, 'Satuan pengukuran tidak boleh kosong.'],
    trim: true,
  },
},{ 
  /**
   * @property {object} timestamps - Opsi untuk secara otomatis menambahkan field `createdAt` dan `updatedAt`.
   */
  timestamps: true 
});

/**
 * @index {unique}
 * @description Membuat sebuah compound unique index pada kombinasi field `name` dan `brand`.
 * Ini memastikan bahwa tidak boleh ada dua produk dengan nama dan brand yang sama persis.
 */
ProductSchema.index({ name: 1, brand: 1 }, { unique: true });

/**
 * @model Product
 * @description Model Mongoose untuk 'Product'.
 * Menggunakan pola "singleton" untuk mencegah model dikompilasi ulang
 * pada setiap hot-reload di lingkungan Next.js.
 */
const Product = models.Product || model('Product', ProductSchema);

export default Product;