/**
 * @file Mendefinisikan skema dan model Mongoose untuk 'ConsumableLog'.
 * Skema ini berfungsi sebagai buku besar untuk setiap transaksi barang habis pakai.
 */

import mongoose, { Schema, model, models } from 'mongoose';

const ConsumableLogSchema = new Schema(
  {
    /**
     * Referensi ke item stok yang terpengaruh oleh transaksi ini.
     */
    stock_item: {
      type: Schema.Types.ObjectId,
      ref: 'ConsumableStock',
      required: true,
    },
    /**
     * Jenis transaksi: penambahan stok atau pengambilan.
     */
    transaction_type: {
      type: String,
      enum: ['penambahan', 'pengambilan'],
      required: true,
    },
    /**
     * Jumlah barang yang berubah dalam transaksi ini.
     */
    quantity_changed: {
      type: Number,
      required: true,
    },
    /**
     * Nama orang yang meminta/mengambil barang (input manual).
     */
    person_name: {
      type: String,
      required: true,
    },
    /**
     * Jabatan orang yang meminta/mengambil barang (input manual).
     */
    person_role: {
      type: String,
    },
    /**
     * Catatan atau keterangan untuk keperluan apa barang diambil.
     */
    notes: {
      type: String,
      trim: true,
    },
    /**
     * Pengguna sistem yang mencatat transaksi ini (untuk audit).
     */
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
  },
  { timestamps: true }
);

const ConsumableLog = models.ConsumableLog || model('ConsumableLog', ConsumableLogSchema);
export default ConsumableLog;
