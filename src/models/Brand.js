/**
 * @file Mendefinisikan skema dan model Mongoose untuk 'Brand'.
 * Skema ini merepresentasikan brand atau merek dari sebuah produk di dalam database.
 */

import mongoose, { Schema, model, models } from 'mongoose';

/**
 * @schema BrandSchema
 * @description Skema Mongoose untuk data brand.
 */
const BrandSchema = new Schema(
  {
    /**
     * @property {string} name - Nama unik dari brand.
     * @property {boolean} required - Nama brand wajib diisi.
     * @property {boolean} unique - Setiap nama brand harus unik di dalam koleksi.
     * @property {boolean} trim - Menghapus spasi di awal dan akhir string nama.
     */
    name: {
      type: String,
      required: [true, 'Nama brand tidak boleh kosong.'],
      unique: true,
      trim: true,
    },
    /**
     * @property {string} description - Deskripsi opsional untuk brand.
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
 * @model Brand
 * @description Model Mongoose untuk 'Brand'.
 * Menggunakan pola "singleton" untuk mencegah model dikompilasi ulang
 * pada setiap hot-reload di lingkungan Next.js.
 */
const Brand = models.Brand || model('Brand', BrandSchema);

export default Brand;
