// Lokasi: /lib/api/services/categoryServices.js

/**
 * @file Layanan terpusat untuk mengelola semua logika bisnis terkait Kategori.
 */

import { z } from 'zod';
import connectToDatabase from '@/lib/database/db';
import Category from '@/models/Category';
import Product from '@/models/Product';

// Skema Zod untuk validasi data kategori yang masuk.
const categorySchema = z.object({
  name: z.string({ required_error: "Nama kategori wajib diisi." }).trim().min(1, { message: 'Nama kategori tidak boleh kosong.' }),
  description: z.string().trim().optional(),
});

// ===================================================================================
//  OPERASI PADA KOLEKSI (Banyak Kategori)
// ===================================================================================

/**
 * Mengambil daftar brand dengan paginasi, sorting, dan filter.
 * @param {object} options - Opsi untuk query.
 * @returns {Promise<{data: Array<object>, totalItems: number}>} Objek berisi data dan jumlah total item.
 */
export async function getPaginatedCategories({ page = 1, limit = 10, sortBy = 'name', order = 'asc', filters = {} }) {
  await connectToDatabase();
  const skip = (page - 1) * limit;
  const sortOptions = { [sortBy]: order === 'desc' ? -1 : 1 };

  // Logika find(filters) akan berfungsi karena API handler sudah menyiapkan objek filter.
  const [data, totalItems] = await Promise.all([
    Category.find(filters).sort(sortOptions).skip(skip).limit(limit).lean(),
    Category.countDocuments(filters)
  ]);

  // Menambahkan hitungan produk untuk setiap kategori secara efisien
  const categoriesWithCount = await Promise.all(data.map(async (category) => {
    const productCount = await Product.countDocuments({ category: category._id });
    return { ...category, productCount };
  }));

  return { data: categoriesWithCount, totalItems };
}

/**
 * Mengambil daftar semua kategori dari database (untuk dropdown).
 * @returns {Promise<Array<object>>} Array berisi semua data kategori.
 */
export async function getAllCategoriesForDropdown() {
  await connectToDatabase();
  const categories = await Category.find({}).sort({ name: 1 }).lean();
  return categories;
}

/**
 * Membuat kategori baru.
 * @param {object} data - Data untuk kategori baru.
 * @returns {Promise<object>} Dokumen kategori yang baru dibuat.
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

// ===================================================================================
//  OPERASI PADA DOKUMEN TUNGGAL (Berdasarkan ID)
// ===================================================================================

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

export async function updateCategoryById(id, data) {
    const validation = categorySchema.partial().safeParse(data);
    if (!validation.success) {
        const validationError = new Error('Input tidak valid.');
        validationError.isValidationError = true;
        validationError.errors = validation.error.flatten().fieldErrors;
        throw validationError;
    }
    await connectToDatabase();
    try {
        const updatedCategory = await Category.findByIdAndUpdate(id, validation.data, { new: true, runValidators: true }).lean();
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

export async function deleteCategoryById(id) {
    await connectToDatabase();
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
}