/**
 * @file Layanan terpusat untuk mengelola semua logika bisnis terkait Brand.
 */

import { z } from 'zod';
import connectToDatabase from '@/lib/database/db';
import Brand from '@/models/Brand';
import Product from '@/models/Product';

// --- Skema Validasi Zod ---
const brandSchema = z.object({
  name: z.string({ required_error: "Nama brand wajib diisi." }).trim().min(1, { message: 'Nama brand tidak boleh kosong.' }),
  description: z.string().trim().optional(),
});

// ===================================================================================
//  OPERASI PADA KOLEKSI (Banyak Brand)
// ===================================================================================

/**
 * Mengambil daftar brand dengan paginasi, sorting, dan filter.
 * @param {object} options - Opsi untuk query.
 * @returns {Promise<{data: Array<object>, totalItems: number}>} Objek berisi data dan jumlah total item.
 */
export async function getPaginatedBrands({ page = 1, limit = 10, sortBy = 'name', order = 'asc', filters = {} }) {
  await connectToDatabase();
  const skip = (page - 1) * limit;
  const sortOptions = { [sortBy]: order === 'desc' ? -1 : 1 };

  // Logika find(filters) akan berfungsi karena API handler sudah menyiapkan objek filter.
  const [data, totalItems] = await Promise.all([
    Brand.find(filters).sort(sortOptions).skip(skip).limit(limit).lean(),
    Brand.countDocuments(filters)
  ]);

  // Menambahkan hitungan produk untuk setiap brand secara efisien
  const brandsWithCount = await Promise.all(data.map(async (brand) => {
    const productCount = await Product.countDocuments({ brand: brand._id });
    return { ...brand, productCount };
  }));

  return { data: brandsWithCount, totalItems };
}

/**
 * Mengambil daftar semua brand dari database (untuk dropdown).
 * @returns {Promise<Array<object>>} Array berisi semua data brand.
 */
export async function getAllBrandsForDropdown() {
  await connectToDatabase();
  const brands = await Brand.find({}).sort({ name: 1 }).lean();
  return brands;
}

/**
 * Membuat brand baru setelah validasi.
 * @param {object} data - Data untuk brand baru.
 * @returns {Promise<object>} Dokumen brand yang baru dibuat.
 */
export async function createBrand(data) {
  const validation = brandSchema.safeParse(data);
  if (!validation.success) {
    const validationError = new Error('Input tidak valid.');
    validationError.isValidationError = true;
    validationError.errors = validation.error.flatten().fieldErrors;
    throw validationError;
  }

  await connectToDatabase();
  try {
    const newBrand = await Brand.create(validation.data);
    return newBrand;
  } catch (error) {
    if (error.code === 11000) {
      const duplicateError = new Error(`Brand dengan nama "${validation.data.name}" sudah ada.`);
      duplicateError.isDuplicate = true;
      throw duplicateError;
    }
    throw error;
  }
}

// ===================================================================================
//  OPERASI PADA DOKUMEN TUNGGAL (Berdasarkan ID)
// ===================================================================================

/**
 * Mengambil satu brand berdasarkan ID.
 * @param {string} id - ID dari brand.
 * @returns {Promise<object>} Dokumen brand yang ditemukan.
 */
export async function getBrandById(id) {
  await connectToDatabase();
  const brand = await Brand.findById(id).lean();

  if (!brand) {
    const notFoundError = new Error('Brand tidak ditemukan.');
    notFoundError.isNotFound = true;
    throw notFoundError;
  }
  return brand;
}

/**
 * Memperbarui satu brand berdasarkan ID.
 * @param {string} id - ID dari brand yang akan diperbarui.
 * @param {object} data - Data baru untuk brand.
 * @returns {Promise<object>} Dokumen brand yang sudah diperbarui.
 */
export async function updateBrandById(id, data) {
  const validation = brandSchema.partial().safeParse(data);
  if (!validation.success) {
    const validationError = new Error('Input tidak valid.');
    validationError.isValidationError = true;
    validationError.errors = validation.error.flatten().fieldErrors;
    throw validationError;
  }

  await connectToDatabase();
  try {
    const updatedBrand = await Brand.findByIdAndUpdate(id, validation.data, {
      new: true,
      runValidators: true
    }).lean();

    if (!updatedBrand) {
      const notFoundError = new Error('Brand tidak ditemukan untuk diperbarui.');
      notFoundError.isNotFound = true;
      throw notFoundError;
    }
    return updatedBrand;
  } catch (error) {
    if (error.code === 11000) {
      const duplicateError = new Error(`Brand dengan nama "${data.name}" sudah ada.`);
      duplicateError.isDuplicate = true;
      throw duplicateError;
    }
    throw error;
  }
}

/**
 * Menghapus satu brand berdasarkan ID.
 * @param {string} id - ID brand yang akan dihapus.
 * @returns {Promise<void>}
 */
export async function deleteBrandById(id) {
  await connectToDatabase();

  // Validasi Kritis: Cek apakah brand masih digunakan.
  const productCount = await Product.countDocuments({ brand: id });
  if (productCount > 0) {
    const conflictError = new Error(`Brand tidak dapat dihapus karena masih digunakan oleh ${productCount} produk.`);
    conflictError.isConflict = true;
    throw conflictError;
  }

  const deletedBrand = await Brand.findByIdAndDelete(id);

  if (!deletedBrand) {
    const notFoundError = new Error('Brand tidak ditemukan untuk dihapus.');
    notFoundError.isNotFound = true;
    throw notFoundError;
  }
}
