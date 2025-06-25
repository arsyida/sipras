/**
 * @file Layanan terpusat untuk mengelola semua logika bisnis terkait Produk.
 */

import { z } from 'zod';
import connectToDatabase from '@/lib/database/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Brand from '@/models/Brand';
import Asset from '@/models/Asset'; // Diperlukan untuk validasi penghapusan
import { getUnbrandedBrandId } from '@/lib/api/services/brandServices';

// Skema untuk mendaftarkan PRODUK BARU (sesuai permintaan Anda)
const productSchema = z.object({
  product_code: z.string({ required_error: "Kode produk wajib diisi." })
    .trim()
    .min(1, { message: 'Kode produk tidak boleh kosong.' }),
  name: z.string({ required_error: "Nama produk wajib diisi." })
    .trim()
    .min(1, { message: 'Nama produk tidak boleh kosong.' }),
  brand: z.string({ required_error: "Brand wajib diisi." })
    .refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: "ID Brand tidak valid.",
  }),
  category: z.string({ required_error: "Kategori wajib diisi." })
    .refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: "ID Kategori tidak valid.",
  }),
  measurement_unit: z.enum(['Pcs', 'Meter', 'Susun', 'Set'], {
    required_error: "Satuan pengukuran wajib diisi.",
    invalid_type_error: "Satuan pengukuran tidak valid."
  }),
});
// -----------------------------------------

// Skema Zod untuk array produk, digunakan dalam operasi bulk
const bulkProductSchema = z.array(productSchema);

// ===================================================================================
//  OPERASI PADA KOLEKSI (Banyak Produk)
// ===================================================================================

/**
 * Mengambil daftar produk dengan paginasi dan fungsionalitas sorting.
 * @param {object} options - Opsi untuk query.
 * @param {number} options.page - Halaman saat ini.
 * @param {number} options.limit - Jumlah item per halaman.
 * @param {string} options.sortBy - Field yang akan dijadikan acuan sorting.
 * @param {'asc' | 'desc'} options.order - Urutan sorting.
 * @returns {Promise<{data: Array<object>, totalItems: number}>} Objek berisi data dan jumlah total item.
 */
export async function getPaginatedProducts({ page = 1, limit = 20, sortBy = 'name', order = 'asc' }) {
    await connectToDatabase();

    const skip = (page - 1) * limit;
    const sortOptions = { [sortBy]: order === 'desc' ? -1 : 1 };

    // Menjalankan query untuk mengambil data dan menghitung total item secara paralel untuk efisiensi.
    const [data, totalItems] = await Promise.all([
        Product.find({})
            .populate({ path: 'category', select: 'name' })
            .populate({ path: 'brand', select: 'name' })
            .sort(sortOptions)
            .skip(skip)
            .limit(limit)
            .lean(),
        Product.countDocuments({})
    ]);

    return { data, totalItems };
}

/**
 * Mengambil daftar semua produk yang disederhanakan untuk UI dropdown.
 * Dioptimalkan untuk performa dengan hanya memilih field _id dan name.
 * @returns {Promise<Array<{_id: string, name: string}>>} Sebuah promise yang resolve ke array objek produk.
 */
export async function getAllProductsForDropdown() {
  await connectToDatabase();
  const products = await Product.find({})
    .select('_id name brand') // Ambil field yang relevan untuk dropdown
    .sort({ name: 1 })
    .lean();
  return products;
}

/**
 * Membuat produk baru setelah validasi.
 * @param {object} data - Data mentah untuk produk baru.
 * @returns {Promise<object>} Dokumen produk yang baru dibuat.
 * @throws {Error} Melemparkan error dengan flag 'isValidationError' atau 'isDuplicate'.
 */
export async function createProduct(data) {
  // Perubahan: Jika brand tidak disediakan, dapatkan ID default
  if (!data.brand) {
    data.brand = await getUnbrandedBrandId();
  }

  // Validasi input menggunakan Zod
  const validation = productSchema.safeParse(data);
  if (!validation.success) {
    const validationError = new Error('Input tidak valid. Silakan periksa kembali data Anda.');
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
      const errorMessage = duplicatedField === 'name' 
        ? `Produk dengan nama "${validation.data.name}" dan brand yang sama sudah ada.`
        : `Produk dengan ${duplicatedField} "${error.keyValue[duplicatedField]}" sudah ada.`;
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
 * @throws {Error} Melemparkan error dengan flag 'isNotFound' jika tidak ditemukan.
 */
export async function getProductById(id) {
  await connectToDatabase();
  const product = await Product.findById(id)
    .populate({ path: 'category', model: Category, select: 'name' })
    .populate({ path: 'brand', model: Brand, select: 'name' })
    .lean();

  if (!product) {
    const notFoundError = new Error('Produk tidak ditemukan.');
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
 * @throws {Error} Melemparkan error 'isNotFound', 'isValidationError', atau 'isDuplicate'.
 */
export async function updateProductById(id, data) {
  const validation = productSchema.partial().safeParse(data);
  if (!validation.success) {
    const validationError = new Error('Input tidak valid.');
    validationError.isValidationError = true;
    validationError.errors = validation.error.flatten().fieldErrors;
    throw validationError;
  }

  await connectToDatabase();
  try {
    const updatedProduct = await Product.findByIdAndUpdate(id, validation.data, {
      new: true,
      runValidators: true
    }).lean();

    if (!updatedProduct) {
      const notFoundError = new Error('Produk tidak ditemukan untuk diperbarui.');
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
 * @returns {Promise<void>} Tidak mengembalikan apa-apa jika sukses.
 * @throws {Error} Melemparkan error 'isConflict' jika produk masih digunakan atau 'isNotFound'.
 */
export async function deleteProductById(id) {
  await connectToDatabase();

  // Validasi bisnis: Pastikan produk tidak sedang digunakan oleh aset manapun.
  const assetCount = await Asset.countDocuments({ product: id });
  if (assetCount > 0) {
    const conflictError = new Error(`Produk tidak dapat dihapus karena masih terhubung dengan ${assetCount} aset.`);
    conflictError.isConflict = true;
    throw conflictError;
  }

  const deletedProduct = await Product.findByIdAndDelete(id);

  if (!deletedProduct) {
    const notFoundError = new Error('Produk tidak ditemukan untuk dihapus.');
    notFoundError.isNotFound = true;
    throw notFoundError;
  }
}

// ===================================================================================
//  OPERASI BULK (BARU DITAMBAHKAN)
// ===================================================================================

/**
 * Membuat beberapa produk sekaligus (bulk insert) setelah validasi.
 * @param {Array<object>} productsData - Array berisi data-data produk yang akan dibuat.
 * @returns {Promise<{ count: number, createdProducts: Array<object> }>} Objek berisi jumlah produk yang berhasil dibuat dan datanya.
 * @throws {Error} Melemparkan error dengan flag 'isValidationError' atau 'isBulkWriteError' jika terjadi kegagalan.
 */
export async function createBulkProducts(productsData) {
  // 1. Validasi bahwa input adalah array yang tidak kosong
  if (!Array.isArray(productsData) || productsData.length === 0) {
    const validationError = new Error('Payload harus berupa array berisi data produk dan tidak boleh kosong.');
    validationError.isValidationError = true;
    throw validationError;
  }

  // Perubahan: Dapatkan ID brand default satu kali untuk efisiensi
  const unbrandedId = await getUnbrandedBrandId();

  // Proses data untuk mengisi brand default jika kosong
  const processedData = productsData.map(product => {
    if (!product.brand) {
      return { ...product, brand: unbrandedId };
    }
    return product;
  });

  // 2. Validasi setiap item di dalam array yang sudah diproses menggunakan skema Zod
  const validation = bulkProductSchema.safeParse(processedData);
  if (!validation.success) {
    const validationError = new Error('Satu atau lebih data produk di dalam array tidak valid.');
    validationError.isValidationError = true;
    validationError.errors = validation.error.format(); // Menyertakan detail error dari Zod
    throw validationError;
  }

  await connectToDatabase();

  try {
    // 3. Gunakan insertMany dengan data yang sudah diproses
    const createdProducts = await Product.insertMany(validation.data, { ordered: false });
    return {
      count: createdProducts.length,
      createdProducts
    };
  } catch (error) {
    // 4. Tangani error spesifik untuk operasi bulk dari MongoDB
    if (error.name === 'MongoBulkWriteError' && error.code === 11000) {
      const bulkWriteError = new Error(`Gagal membuat beberapa produk karena ada data duplikat.`);
      bulkWriteError.isBulkWriteError = true;
      // Memberikan detail error untuk debugging di frontend jika diperlukan
      bulkWriteError.details = {
        insertedCount: error.result.nInserted,
        failedCount: error.writeErrors.length,
        errors: error.writeErrors.map(err => ({
          index: err.index,
          code: err.code,
          message: `Item di index ${err.index} gagal: Duplikasi pada field ${Object.keys(err.keyValue)}.`
        }))
      };
      throw bulkWriteError;
    }
    // Lempar error lainnya untuk ditangani sebagai error server
    throw error;
  }
}