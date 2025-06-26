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
 * Mengambil daftar kategori dengan paginasi dan filter.
 * @param {object} options - Opsi untuk query.
 * @returns {Promise<{data: Array<object>, totalItems: number}>}
 */
export async function getPaginatedCategories({ page = 1, limit = 10, filters = {} }) {
    await connectToDatabase();
    const skip = (page - 1) * limit;
    
    const query = {};
    if (filters.name) {
        query.name = { $regex: filters.name, $options: 'i' };
    }

    const [data, totalItems] = await Promise.all([
        Category.find(query).sort({ name: 1 }).skip(skip).limit(limit).lean(),
        Category.countDocuments(query)
    ]);
    
    const categoriesWithCount = await Promise.all(data.map(async (category) => {
        const assetCount = await Product.countDocuments({ category: category._id });
        return { ...category, assetCount };
    }));

    return { data: categoriesWithCount, totalItems };
}

/**
 * Mengambil semua kategori untuk dropdown.
 * @returns {Promise<Array<object>>}
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