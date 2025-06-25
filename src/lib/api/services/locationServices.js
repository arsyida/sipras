/**
 * @file Layanan terpusat untuk mengelola semua logika bisnis terkait Lokasi.
 */

import { z } from 'zod';
import connectToDatabase from '@/lib/database/db';
import Location from '@/models/Location';
import Asset from '@/models/Asset'; // Diperlukan untuk validasi penghapusan

// --- Skema Validasi Zod ---
const locationSchema = z.object({
  name: z.string({ required_error: "Nama lokasi wajib diisi." }).trim().min(1, { message: 'Nama lokasi tidak boleh kosong.' }),
  building: z.string({ required_error: "Nama gedung wajib diisi." }).trim().min(1, { message: 'Nama gedung tidak boleh kosong.' }),
  floor: z.string({ required_error: "Lantai wajib diisi." }).trim().min(1, { message: 'Lantai tidak boleh kosong.' }),
  description: z.string().trim().optional(),
});

// ===================================================================================
//  OPERASI PADA KOLEKSI (Banyak Lokasi)
// ===================================================================================

/**
 * Mengambil daftar semua lokasi dari database.
 * @returns {Promise<Array<object>>} Array berisi semua data lokasi.
 */
export async function getAllLocations() {
  await connectToDatabase();
  const locations = await Location.find({}).sort({ building: 1, floor: 1, name: 1 }).lean();
  return locations;
}

/**
 * Membuat lokasi baru setelah validasi.
 * @param {object} data - Data untuk lokasi baru.
 * @returns {Promise<object>} Dokumen lokasi yang baru dibuat.
 * @throws {Error} Melemparkan error dengan flag 'isValidationError' atau 'isDuplicate'.
 */
export async function createLocation(data) {
  const validation = locationSchema.safeParse(data);
  if (!validation.success) {
    const validationError = new Error('Input tidak valid.');
    validationError.isValidationError = true;
    validationError.errors = validation.error.flatten().fieldErrors;
    throw validationError;
  }
  await connectToDatabase();
  try {
    const newLocation = await Location.create(validation.data);
    return newLocation;
  } catch (error) {
    if (error.code === 11000) {
      const duplicateError = new Error('Kombinasi Nama, Gedung, dan Lantai untuk lokasi sudah ada.');
      duplicateError.isDuplicate = true;
      throw duplicateError;
    }
    throw error;
  }
}

// ===================================================================================
//  OPERASI PADA DOKUMEN TUNGGAL (Berdasarkan ID) - BARU DITAMBAHKAN
// ===================================================================================

/**
 * Mengambil satu lokasi berdasarkan ID.
 * @param {string} id - ID dari lokasi.
 * @returns {Promise<object>} Dokumen lokasi yang ditemukan.
 * @throws {Error} Melemparkan error dengan flag 'isNotFound' jika tidak ditemukan.
 */
export async function getLocationById(id) {
  await connectToDatabase();
  const location = await Location.findById(id).lean();

  if (!location) {
    const notFoundError = new Error('Lokasi tidak ditemukan.');
    notFoundError.isNotFound = true;
    throw notFoundError;
  }
  return location;
}

/**
 * Memperbarui satu lokasi berdasarkan ID.
 * @param {string} id - ID dari lokasi yang akan diperbarui.
 * @param {object} data - Data baru untuk lokasi.
 * @returns {Promise<object>} Dokumen lokasi yang sudah diperbarui.
 * @throws {Error} Melemparkan error 'isNotFound', 'isValidationError', atau 'isDuplicate'.
 */
export async function updateLocationById(id, data) {
  // Gunakan .partial() untuk memperbolehkan update sebagian field saja.
  const validation = locationSchema.partial().safeParse(data);
  if (!validation.success) {
    const validationError = new Error('Input tidak valid.');
    validationError.isValidationError = true;
    validationError.errors = validation.error.flatten().fieldErrors;
    throw validationError;
  }

  await connectToDatabase();
  try {
    const updatedLocation = await Location.findByIdAndUpdate(id, validation.data, {
      new: true,
      runValidators: true
    }).lean();

    if (!updatedLocation) {
      const notFoundError = new Error('Lokasi tidak ditemukan untuk diperbarui.');
      notFoundError.isNotFound = true;
      throw notFoundError;
    }
    return updatedLocation;
  } catch (error) {
    if (error.code === 11000) {
      const duplicateError = new Error('Kombinasi Nama, Gedung, dan Lantai sudah ada.');
      duplicateError.isDuplicate = true;
      throw duplicateError;
    }
    throw error;
  }
}

/**
 * Menghapus satu lokasi berdasarkan ID.
 * @param {string} id - ID lokasi yang akan dihapus.
 * @returns {Promise<void>} Tidak mengembalikan apa-apa jika sukses.
 * @throws {Error} Melemparkan error 'isConflict' jika lokasi masih digunakan atau 'isNotFound'.
 */
export async function deleteLocationById(id) {
  await connectToDatabase();

  // Validasi bisnis: Pastikan lokasi tidak sedang digunakan oleh aset manapun.
  const assetCount = await Asset.countDocuments({ location: id });
  if (assetCount > 0) {
    const conflictError = new Error(`Lokasi tidak dapat dihapus karena masih menjadi tempat bagi ${assetCount} aset.`);
    conflictError.isConflict = true;
    throw conflictError;
  }

  const deletedLocation = await Location.findByIdAndDelete(id);

  if (!deletedLocation) {
    const notFoundError = new Error('Lokasi tidak ditemukan untuk dihapus.');
    notFoundError.isNotFound = true;
    throw notFoundError;
  }
}
