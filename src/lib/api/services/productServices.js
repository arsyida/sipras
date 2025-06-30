/**
 * @file Layanan terpusat untuk mengelola semua logika bisnis terkait Produk.
 */

import { z } from "zod";
import connectToDatabase from "@/lib/database/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Brand from "@/models/Brand";
import Asset from "@/models/Asset"; // Diperlukan untuk validasi penghapusan
import mongoose, { Types } from "mongoose"; // Impor Types untuk validasi ObjectId

// --- Skema Validasi Zod ---

const productSchema = z.object({
  product_code: z
    .string({ required_error: "Kode produk wajib diisi." })
    .trim()
    .min(1, { message: "Kode produk tidak boleh kosong." }),
  name: z
    .string({ required_error: "Nama produk wajib diisi." })
    .trim()
    .min(1, { message: "Nama produk tidak boleh kosong." }),
  brand: z
    .string({ required_error: "Brand wajib diisi." })
    .refine((val) => Types.ObjectId.isValid(val), {
      message: "ID Brand tidak valid.",
    }),
  category: z
    .string({ required_error: "Kategori wajib diisi." })
    .refine((val) => Types.ObjectId.isValid(val), {
      message: "ID Kategori tidak valid.",
    }),
  measurement_unit: z.enum(["Pcs", "Meter", "Susun", "Set"], {
    required_error: "Satuan pengukuran wajib diisi.",
  }),
});

// ===================================================================================
//  OPERASI PADA KOLEKSI (Banyak Produk)
// ===================================================================================

/**
 * Mengambil daftar produk dengan paginasi, sorting, dan filter.
 * @param {object} options - Opsi untuk query.
 * @returns {Promise<{data: Array<object>, totalItems: number}>}
 */
export async function getPaginatedProducts({ page = 1, limit = 10, sortBy = 'name', order = 'asc', filters = {} }) {
  await connectToDatabase();
  const skip = (page - 1) * limit;
  const sortOptions = { [sortBy]: order === 'desc' ? -1 : 1 };

  const [data, totalItems] = await Promise.all([
    Product.find(filters)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .populate({ path: 'brand', select: 'name' })
      .populate({ path: 'category', select: 'name' })
      .lean(),
    Product.countDocuments(filters)
  ]);

  // Menambahkan hitungan aset untuk setiap produk
  const productsWithAssetCount = await Promise.all(data.map(async (product) => {
      const assetCount = await Asset.countDocuments({ product: product._id });
      return { ...product, assetCount };
  }));

  return { data: productsWithAssetCount, totalItems };
}


/**
 * Mengambil semua produk untuk dropdown, hanya mengembalikan nama dan ID.
 * @returns {Promise<Array<object>>}
 */
export async function getAllProductsForDropdown() {
  await connectToDatabase();
  // Mengambil semua produk dan melakukan populate pada field 'brand'
  const products = await Product.find({})
    .select('name brand measurement_unit') // Pastikan field 'brand' ikut diambil untuk bisa di-populate
    .populate({
      path: 'brand',      // Nama field yang akan di-populate
      select: 'name'    // Hanya ambil field 'name' dari dokumen brand
    })
    .sort({ name: 1 })
    .lean();
    
  return products;
}

/**
 * Membuat produk baru setelah validasi.
 * @param {object} data - Data mentah untuk produk baru.
 * @returns {Promise<object>} Dokumen produk yang baru dibuat.
 */
export async function createProduct(data) {
  // Jika brand tidak disediakan, kita bisa mengisinya dengan brand "Tanpa Merek"
  // Asumsi ada fungsi getUnbrandedBrandId() di brandServices
  // if (!data.brand) {
  //   data.brand = await getUnbrandedBrandId();
  // }

  const validation = productSchema.safeParse(data);
  if (!validation.success) {
    const validationError = new Error("Input tidak valid. Silakan periksa kembali data Anda.");
    validationError.isValidationError = true;
    validationError.errors = validation.error.flatten().fieldErrors;
    throw validationError;
  }

  await connectToDatabase();
  try {
    const newProduct = await Product.create(validation.data);
    return newProduct;
  } catch (error) {
    if (error.code === 11000) {
      const duplicatedField = Object.keys(error.keyValue)[0];
      const errorMessage = `Produk dengan ${duplicatedField} '${error.keyValue[duplicatedField]}' sudah ada.`;
      const duplicateError = new Error(errorMessage);
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
 * Mengambil satu produk berdasarkan ID, di-populate dengan nama brand dan kategori.
 * @param {string} id - ID dari produk.
 * @returns {Promise<object>} Dokumen produk yang ditemukan.
 */
export async function getProductById(id) {
  await connectToDatabase();
  const product = await Product.findById(id)
    .populate({ path: "category", model: Category, select: "name" })
    .populate({ path: "brand", model: Brand, select: "name" })
    .lean();

  if (!product) {
    const notFoundError = new Error("Produk tidak ditemukan.");
    notFoundError.isNotFound = true;
    throw notFoundError;
  }
  return product;
}

/**
 * Memperbarui satu produk berdasarkan ID.
 * @param {string} id - ID dari produk yang akan diperbarui.
 * @param {object} data - Data baru untuk produk.
 * @returns {Promise<object>} Dokumen produk yang sudah diperbarui.
 */
export async function updateProductById(id, data) {
  const validation = productSchema.partial().safeParse(data);
  if (!validation.success) {
    const validationError = new Error("Input tidak valid.");
    validationError.isValidationError = true;
    validationError.errors = validation.error.flatten().fieldErrors;
    throw validationError;
  }

  await connectToDatabase();
  try {
    const updatedProduct = await Product.findByIdAndUpdate(id, validation.data, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updatedProduct) {
      const notFoundError = new Error("Produk tidak ditemukan untuk diperbarui.");
      notFoundError.isNotFound = true;
      throw notFoundError;
    }
    return updatedProduct;
  } catch (error) {
    if (error.code === 11000) {
      const duplicatedField = Object.keys(error.keyValue)[0];
      const errorMessage = `Gagal memperbarui. ${duplicatedField} '${error.keyValue[duplicatedField]}' sudah ada.`;
      const duplicateError = new Error(errorMessage);
      duplicateError.isDuplicate = true;
      throw duplicateError;
    }
    throw error;
  }
}

/**
 * Menghapus satu produk berdasarkan ID.
 * @param {string} id - ID produk yang akan dihapus.
 */
export async function deleteProductById(id) {
  await connectToDatabase();

  const assetCount = await Asset.countDocuments({ product: id });
  if (assetCount > 0) {
    const conflictError = new Error(`Produk tidak dapat dihapus karena masih terhubung dengan ${assetCount} aset.`);
    conflictError.isConflict = true;
    throw conflictError;
  }

  const deletedProduct = await Product.findByIdAndDelete(id);

  if (!deletedProduct) {
    const notFoundError = new Error("Produk tidak ditemukan untuk dihapus.");
    notFoundError.isNotFound = true;
    throw notFoundError;
  }
}
