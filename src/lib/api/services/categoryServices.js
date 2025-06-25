/**
 * @file Layanan terpusat untuk mengelola semua logika bisnis terkait Kategori.
 * Berinteraksi langsung dengan model database dan menyediakan data untuk API endpoints.
 */

import { z } from 'zod';
import connectToDatabase from '@/lib/database/db';
import Category from '@/models/Category';
import Product from '@/models/Product';

// --- Skema Validasi ---
const categorySchema = z.object({
  name: z.string().trim().min(3, { message: 'Nama kategori minimal 3 karakter.' }),
  description: z.string().trim().optional(),
});

// ===================================================================================
//  OPERASI PADA KOLEKSI (Banyak Kategori)
// ===================================================================================

/**
 * Membuat kategori baru di database.
 * @param {object} data - Data untuk kategori baru.
 * @returns {Promise<object>} Dokumen kategori yang baru dibuat.
 * @throws {Error} Melemparkan error dengan flag 'isValidationError' atau 'isDuplicate'.
 */
export async function createCategory(data) {
  const validation = categorySchema.safeParse(data);
  if (!validation.success) {
    const validationError = new Error('Input tidak valid.');
    validationError.isValidationError = true;
    validationError.errors = validation.error.flatten().fieldErrors;
    throw validationError;
  }

  await connectToDatabase();
  try {
    const newCategory = await Category.create(validation.data);
    return newCategory;
  } catch (error) {
    if (error.code === 11000) {
      const duplicateError = new Error(`Kategori dengan nama "${validation.data.name}" sudah ada.`);
      duplicateError.isDuplicate = true;
      throw duplicateError;
    }
    throw error;
  }
}

/**
 * Mengambil daftar kategori dengan paginasi.
 * @param {object} options - Opsi paginasi dan sorting.
 * @returns {Promise<{data: Array<object>, totalItems: number}>} Data kategori dan jumlah total.
 */
export async function getPaginatedCategories({ page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' }) {
  await connectToDatabase();
  const skip = (page - 1) * limit;
  const sortOptions = { [sortBy]: order === 'desc' ? -1 : 1 };

  const [data, totalItems] = await Promise.all([
    Category.find({}).sort(sortOptions).skip(skip).limit(limit).lean(),
    Category.countDocuments({})
  ]);

  return { data, totalItems };
}

/**
 * Mengambil semua kategori untuk UI dropdown.
 * @returns {Promise<Array<{_id: string, name: string}>>} Array kategori yang disederhanakan.
 */
export async function getAllCategoriesForDropdown() {
  await connectToDatabase();
  const categories = await Category.find({}).select('_id name').sort({ name: 1 }).lean();
  return categories;
}

// ===================================================================================
//  OPERASI PADA DOKUMEN TUNGGAL (Berdasarkan ID)
// ===================================================================================

/**
 * Mengambil satu kategori berdasarkan ID.
 * @param {string} id - ID dari kategori.
 * @returns {Promise<object>} Dokumen kategori yang ditemukan.
 * @throws {Error} Melemparkan error dengan flag 'isNotFound' jika kategori tidak ada.
 */
export async function getCategoryById(id) {
  await connectToDatabase();
  const category = await Category.findById(id).lean();

  if (!category) {
    const notFoundError = new Error('Kategori tidak ditemukan.');
    notFoundError.isNotFound = true;
    throw notFoundError;
  }
  return category;
}

/**
 * Memperbarui satu kategori berdasarkan ID.
 * @param {string} id - ID dari kategori yang akan diperbarui.
 * @param {object} data - Data baru untuk kategori.
 * @returns {Promise<object>} Dokumen kategori yang sudah diperbarui.
 * @throws {Error} Melemparkan error 'isNotFound', 'isValidationError', atau 'isDuplicate'.
 */
export async function updateCategoryById(id, data) {
  // Hanya validasi field yang dikirimkan. Zod akan mengabaikan field yang tidak ada di skema.
  const validation = categorySchema.partial().safeParse(data);
  if (!validation.success) {
    const validationError = new Error('Input tidak valid.');
    validationError.isValidationError = true;
    validationError.errors = validation.error.flatten().fieldErrors;
    throw validationError;
  }

  await connectToDatabase();
  try {
    const updatedCategory = await Category.findByIdAndUpdate(id, validation.data, {
      new: true, // Mengembalikan dokumen yang sudah diupdate
      runValidators: true // Menjalankan validator dari Mongoose Schema
    }).lean();

    if (!updatedCategory) {
      const notFoundError = new Error('Kategori tidak ditemukan untuk diperbarui.');
      notFoundError.isNotFound = true;
      throw notFoundError;
    }
    return updatedCategory;
  } catch (error) {
    if (error.code === 11000) {
      const duplicateError = new Error(`Kategori dengan nama "${validation.data.name}" sudah ada.`);
      duplicateError.isDuplicate = true;
      throw duplicateError;
    }
    throw error;
  }
}

/**
 * Menghapus satu kategori berdasarkan ID setelah validasi.
 * @param {string} id - ID dari kategori yang akan dihapus.
 * @returns {Promise<void>} Tidak mengembalikan apa-apa jika sukses.
 * @throws {Error} Melemparkan error 'isConflict' jika masih digunakan atau 'isNotFound' jika tidak ada.
 */
export async function deleteCategoryById(id) {
  await connectToDatabase();

  // Validasi bisnis: Cek apakah kategori masih terikat pada produk.
  const productCount = await Product.countDocuments({ category: id });
  if (productCount > 0) {
    const conflictError = new Error(`Kategori tidak dapat dihapus karena masih digunakan oleh ${productCount} produk.`);
    conflictError.isConflict = true;
    throw conflictError;
  }

  const deletedCategory = await Category.findByIdAndDelete(id);

  if (!deletedCategory) {
    const notFoundError = new Error('Kategori tidak ditemukan untuk dihapus.');
    notFoundError.isNotFound = true;
    throw notFoundError;
  }
  // Tidak perlu mengembalikan apa-apa, keberhasilan eksekusi sudah cukup.
}
