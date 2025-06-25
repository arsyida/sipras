/**
 * @file Layanan terpusat untuk mengelola semua logika bisnis terkait Brand.
 */

import { z } from 'zod';
import connectToDatabase from '@/lib/database/db';
import Brand from '@/models/Brand';
import Product from '@/models/Product'; // Diperlukan untuk validasi penghapusan

// Skema Zod untuk validasi data brand yang masuk.
const brandSchema = z.object({
  name: z.string({ required_error: "Nama brand wajib diisi." }).trim().min(1, { message: 'Nama brand tidak boleh kosong.' }),
  description: z.string().trim().optional(),
});


/**
 * Mengambil daftar semua brand dari database, diurutkan berdasarkan nama.
 * @returns {Promise<Array<object>>} Sebuah promise yang resolve ke array berisi semua data brand.
 */
export async function getAllBrands() {
  await connectToDatabase();

  const brands = await Brand.find({})
    .sort({ name: 1 })
    .lean(); // Menggunakan .lean() untuk performa query baca yang lebih baik

  return brands;
}

/**
 * Membuat brand baru setelah validasi.
 * @param {object} data - Data untuk brand baru (name, description).
 * @returns {Promise<object>} Dokumen brand yang baru dibuat.
 * @throws {Error} Melemparkan error dengan flag 'isValidationError' atau 'isDuplicate'.
 */
export async function createBrand(data) {
  // 1. Validasi input menggunakan Zod
  const validation = brandSchema.safeParse(data);
  if (!validation.success) {
    const validationError = new Error('Input tidak valid. Nama brand wajib diisi.');
    validationError.isValidationError = true;
    validationError.errors = validation.error.flatten().fieldErrors;
    throw validationError;
  }

  await connectToDatabase();

  try {
    // 2. Buat dokumen menggunakan data yang sudah divalidasi
    const newBrand = await Brand.create(validation.data);
    return newBrand;
  } catch (error) {
    // 3. Tangani error duplikasi data dari database
    if (error.code === 11000) {
      const duplicateError = new Error(`Brand dengan nama "${validation.data.name}" sudah ada.`);
      duplicateError.isDuplicate = true;
      throw duplicateError;
    }
    // Lempar error lain untuk ditangani sebagai 500
    throw error;
  }
}

// ===================================================================================
//  OPERASI PADA DOKUMEN TUNGGAL (Berdasarkan ID) - BARU DITAMBAHKAN
// ===================================================================================

/**
 * Mengambil satu brand berdasarkan ID.
 * @param {string} id - ID dari brand.
 * @returns {Promise<object>} Dokumen brand yang ditemukan.
 * @throws {Error} Melemparkan error dengan flag 'isNotFound' jika tidak ditemukan.
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
 * @throws {Error} Melemparkan error 'isNotFound', 'isValidationError', atau 'isDuplicate'.
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
            const duplicateError = new Error(`Brand dengan nama "${validation.data.name}" sudah ada.`);
            duplicateError.isDuplicate = true;
            throw duplicateError;
        }
        throw error;
    }
}

/**
 * Menghapus satu brand berdasarkan ID.
 * @param {string} id - ID brand yang akan dihapus.
 * @returns {Promise<{deletedBrandName: string}>} Mengembalikan objek berisi nama brand yang dihapus.
 * @throws {Error} Melemparkan error 'isConflict' jika brand masih digunakan atau 'isNotFound'.
 */
export async function deleteBrandById(id) {
    await connectToDatabase();

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
    
    return { deletedBrandName: deletedBrand.name };
}

export async function getUnbrandedBrandId() {
  await connectToDatabase();
  const UNBRANDED_NAME = "Tanpa Merk";
  
  // Cari brand default, hanya ambil field _id untuk efisiensi
  let unbrandedBrand = await Brand.findOne({ name: UNBRANDED_NAME }).select('_id').lean();

  // Jika tidak ditemukan, buat brand default baru
  if (!unbrandedBrand) {
    console.log('Creating default "Tidak Bermerek" brand...');
    unbrandedBrand = await Brand.create({ name: UNBRANDED_NAME, description: 'Brand default untuk produk tanpa merek.' });
  }

  return unbrandedBrand._id.toString();
}
