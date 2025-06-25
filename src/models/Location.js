/**
 * @file Mendefinisikan skema dan model Mongoose untuk 'Location'.
 * Skema ini merepresentasikan lokasi fisik di mana sebuah aset atau produk berada.
 */

import mongoose, { Schema, model, models } from 'mongoose';

/**
 * @schema LocationSchema
 * @description Skema Mongoose untuk data lokasi.
 */
const LocationSchema = new Schema(
  {
    /**
     * @property {string} name - Nama spesifik dari lokasi (misal: "Ruang Server", "Lobi Utama").
     * @property {boolean} required - Nama lokasi wajib diisi.
     * @property {boolean} trim - Menghapus spasi di awal dan akhir string.
     */
    name: {
      type: String,
      required: [true, 'Nama lokasi tidak boleh kosong.'],
      trim: true,
    },
    /**
     * @property {string} building - Nama gedung tempat lokasi berada.
     * @property {boolean} required - Nama gedung wajib diisi.
     * @property {boolean} trim - Menghapus spasi di awal dan akhir string.
     */
    building: {
      type: String,
      required: [true, 'Nama gedung tidak boleh kosong.'],
      trim: true,
    },
    /**
     * @property {string} floor - Lantai tempat lokasi berada (misal: "1", "2", "UG").
     * @property {boolean} required - Lantai wajib diisi.
     * @property {boolean} trim - Menghapus spasi di awal dan akhir string.
     */
    floor: {
      type: String,
      required: [true, 'Lantai tidak boleh kosong.'],
      trim: true,
    },
    /**
     * @property {string} description - Deskripsi opsional untuk memberikan detail tambahan tentang lokasi.
     */
    description: {
        type: String,
        trim: true,
        default: '',
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
 * @index {unique}
 * @description Membuat sebuah compound unique index pada kombinasi field `name`, `building`, dan `floor`.
 * Ini memastikan bahwa tidak boleh ada dua dokumen lokasi dengan nama, gedung, dan lantai yang sama persis.
 */
LocationSchema.index({ name: 1, building: 1, floor: 1 }, { unique: true });

/**
 * @model Location
 * @description Model Mongoose untuk 'Location'.
 * Menggunakan pola "singleton" untuk mencegah model dikompilasi ulang
 * pada setiap hot-reload di lingkungan Next.js.
 */
const Location = models.Location || model('Location', LocationSchema);

export default Location;
