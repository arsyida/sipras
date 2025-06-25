/**
 * @file Mendefinisikan skema dan model Mongoose untuk 'Category'.
 * Skema ini merepresentasikan kategori dari sebuah produk atau aset di dalam database.
 */

import mongoose, { Schema, model, models } from 'mongoose';

/**
 * @schema CategorySchema
 * @description Skema Mongoose untuk data kategori.
 */
const CategorySchema = new Schema(
  {
    /**
     * @property {string} name - Nama unik dari kategori.
     * @property {boolean} required - Nama kategori wajib diisi.
     * @property {boolean} unique - Setiap nama kategori harus unik di dalam koleksi.
     * @property {boolean} trim - Menghapus spasi di awal dan akhir string nama.
     */
    name: {
      type: String,
      required: [true, 'Nama kategori tidak boleh kosong.'],
      unique: true,
      trim: true,
    },
    /**
     * @property {string} description - Deskripsi opsional untuk kategori.
     */
    description: {
      type: String,
      trim: true,
      default: '', // Memberikan nilai default string kosong
    },
  },
  {
    /**
     * @property {object} timestamps - Opsi untuk secara otomatis menambahkan field `createdAt` dan `updatedAt`.
     */
    timestamps: true,
  }
);

/**
 * @model Category
 * @description Model Mongoose untuk 'Category'.
 * Menggunakan pola "singleton" untuk mencegah model dikompilasi ulang
 * pada setiap hot-reload di lingkungan Next.js.
 */
const Category = models.Category || model('Category', CategorySchema);

export default Category;
