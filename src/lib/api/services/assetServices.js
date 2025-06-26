/**
 * @file Layanan terpusat untuk mengelola semua logika bisnis terkait Aset.
 */

import { z } from 'zod';
import connectToDatabase from '@/lib/database/db';
import Asset from '@/models/Asset';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Location from '@/models/Location';
import { generateSerialNumber } from '@/lib/api/services/generateSerialNumber';
import mongoose, { Types} from 'mongoose';

// --- Skema Validasi Input menggunakan Zod ---
const assetRegistrationSchema = z.object({
  product: z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: "ID Produk tidak valid.",
  }),
  location: z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: "ID Lokasi tidak valid.",
  }),
  condition: z.enum(['Baik', 'Rusak', 'Kurang Baik']).default('Baik'),
  purchase_date: z.string().optional(),
  estimated_price: z.number().optional(),
  attributes: z.record(z.any()).optional(),
});
// -----------------------------------------

// Skema validasi Zod untuk data yang masuk dari form
const assetBulkSchema = z.object({
  product: z.string().min(1, "Produk harus dipilih."),
  location: z.string().min(1, "Lokasi harus dipilih."),
  purchase_date: z.string().optional(),
  quantity: z.number().int().min(1, "Jumlah harus minimal 1."),
  estimated_price: z.number().min(0, "Harga harus angka positif."),
  condition: z.enum(['Baik', 'Rusak', 'Kurang Baik']).default('Baik'),
});

// Skema Zod untuk validasi saat memperbarui aset. Semua field bersifat opsional.
const assetUpdateSchema = assetRegistrationSchema.partial();


// ===================================================================================
//  OPERASI PADA KOLEKSI
// ===================================================================================

/**
 * Mengambil daftar aset dengan filter, sorting, dan paginasi.
 * @param {object} options - Opsi untuk query.
 * @returns {Promise<{assets: Array<object>, totalAssets: number}>} Objek berisi data aset dan jumlah total aset yang cocok.
 */
export async function getPaginatedAssets({ page = 1, limit = 20, filters = {} }) {
  await connectToDatabase();
  const skip = (page - 1) * limit;

  const [assets, totalAssets] = await Promise.all([
    Asset.find(filters)
      .populate({
        path: 'product',
        model: Product,
        select: 'name product_code',
        populate: { path: 'category', model: Category, select: 'name' }
      })
      .populate({
        path: 'location',
        model: Location,
        select: 'name building floor'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Asset.countDocuments(filters)
  ]);

  return { assets, totalAssets };
}

/**
 * Mendaftarkan satu aset baru.
 * @param {object} data - Data mentah untuk aset baru.
 * @returns {Promise<object>} Dokumen aset yang baru dibuat.
 * @throws {Error} Melemparkan error spesifik jika terjadi kegagalan.
 */
export async function registerNewAsset(data) {
  // 1. Validasi input menggunakan Zod
  const validation = assetRegistrationSchema.safeParse(data);
  if (!validation.success) {
    // Membuat error kustom yang bisa ditangkap oleh API Route
    const validationError = new Error('Input tidak valid. Silakan periksa kembali data Anda.');
    validationError.isValidationError = true;
    validationError.errors = validation.error.flatten().fieldErrors;
    throw validationError;
  }
  
  // 2. Gunakan data yang sudah divalidasi dan dibersihkan oleh Zod
  const { product: productId, location: locationId, ...otherData } = validation.data;
  
  await connectToDatabase();

  // 3. Panggil fungsi generate yang sudah ada di file ini
  const serial_number = await generateSerialNumber(productId, locationId);

  try {
    // 4. Buat aset baru
    const newAsset = await Asset.create({
      ...otherData,
      product: productId,
      location: locationId,
      serial_number: serial_number,
    });
    return newAsset;
  } catch (error) {
    // Penanganan error untuk duplikasi data dari database
    if (error.code === 11000) {
      const duplicatedField = Object.keys(error.keyValue)[0];
      const duplicateError = new Error(`Gagal membuat aset. ${duplicatedField} '${error.keyValue[duplicatedField]}' sudah ada.`);
      duplicateError.isDuplicate = true;
      throw duplicateError;
    }
    // Melemparkan error lainnya untuk ditangani oleh API Route
    throw error;
  }
}

// ===================================================================================
//  OPERASI PADA DOKUMEN TUNGGAL
// ===================================================================================

/**
 * Mengambil detail satu aset berdasarkan ID-nya, lengkap dengan data relasional.
 * @param {string} id - ID dari aset.
 * @returns {Promise<object>} Dokumen aset yang ditemukan.
 * @throws {Error} Melemparkan error 'isNotFound' jika aset tidak ditemukan.
 */
export async function getAssetById(id) {
    await connectToDatabase();
    const asset = await Asset.findById(id)
      .populate({
        path: 'product',
        model: Product,
        select: 'name product_code brand category',
        populate: [
          { path: 'category', model: Category, select: 'name' },
          { path: 'brand', model: Brand, select: 'name' }
        ]
      })
      .populate({ path: 'location', model: Location })
      .lean();

    if (!asset) {
        const notFoundError = new Error('Aset tidak ditemukan.');
        notFoundError.isNotFound = true;
        throw notFoundError;
    }
    return asset;
}

/**
 * Memperbarui data satu aset berdasarkan ID-nya.
 * @param {string} id - ID dari aset yang akan diperbarui.
 * @param {object} data - Data baru untuk aset.
 * @returns {Promise<object>} Dokumen aset yang sudah diperbarui.
 * @throws {Error} Melemparkan error 'isNotFound', 'isValidationError', atau 'isDuplicate'.
 */
export async function updateAssetById(id, data) {
    const validation = assetUpdateSchema.safeParse(data);
    if (!validation.success) {
        const validationError = new Error('Input tidak valid.');
        validationError.isValidationError = true;
        validationError.errors = validation.error.flatten().fieldErrors;
        throw validationError;
    }

    await connectToDatabase();
    try {
        const updatedAsset = await Asset.findByIdAndUpdate(id, validation.data, {
            new: true,
            runValidators: true
        }).lean();

        if (!updatedAsset) {
            const notFoundError = new Error('Aset tidak ditemukan untuk diperbarui.');
            notFoundError.isNotFound = true;
            throw notFoundError;
        }
        return updatedAsset;
    } catch (error) {
        if (error.code === 11000) {
            const duplicatedField = Object.keys(error.keyValue)[0];
            const duplicateError = new Error(`Gagal memperbarui. ${duplicatedField} '${error.keyValue[duplicatedField]}' sudah ada.`);
            duplicateError.isDuplicate = true;
            throw duplicateError;
        }
        throw error;
    }
}

/**
 * Menghapus satu aset (penghapusan permanen) berdasarkan ID-nya.
 * @param {string} id - ID dari aset yang akan dihapus.
 * @returns {Promise<void>} Tidak mengembalikan apa-apa jika sukses.
 * @throws {Error} Melemparkan error 'isNotFound' jika aset tidak ditemukan.
 */
export async function deleteAssetById(id) {
    await connectToDatabase();
    const deletedAsset = await Asset.findByIdAndDelete(id);

    if (!deletedAsset) {
        const notFoundError = new Error('Aset tidak ditemukan untuk dihapus.');
        notFoundError.isNotFound = true;
        throw notFoundError;
    }
}

/**
 * Mendaftarkan beberapa aset sekaligus berdasarkan quantity, dengan mengadopsi
 * logika dari generateSerialNumber untuk membuat nomor seri unik secara massal.
 * @param {object} data - Data dari form.
 * @returns {Promise<Array>} Array dari dokumen aset yang baru dibuat.
 */
export async function registerBulkAssets(data) {
  // 1. Validasi input menggunakan Zod
  const validation = assetBulkSchema.safeParse(data);
  if (!validation.success) {
    const validationError = new Error('Input tidak valid. Silakan periksa kembali data Anda.');
    validationError.isValidationError = true;
    validationError.errors = validation.error.flatten().fieldErrors;
    throw validationError;  
  }
  
  const { quantity, product: productId, location: locationId, ...commonData } = validation.data;
  
  await connectToDatabase();

  // 2. Mengambil informasi awal untuk pembuatan nomor seri (hanya 1x query)
  const [product, location, assetCountInLocation] = await Promise.all([
    Product.findById(productId).select('product_code').lean(),
    Location.findById(locationId).select('building floor name').lean(),
    Asset.countDocuments({ 
      product: new mongoose.Types.ObjectId(productId), 
      location: new mongoose.Types.ObjectId(locationId) 
    })
  ]);

  // Validasi data
  if (!product || !product.product_code) throw new Error(`Produk dengan ID ${productId} tidak valid.`);
  if (!location) throw new Error(`Lokasi dengan ID ${locationId} tidak valid.`);

  // 3. Siapkan prefiks nomor seri
  const roomNameMatch = location.name.match(/^\d+/);
  const roomNumber = roomNameMatch ? roomNameMatch[0] : 'N/A';
  const prefix = `G${location.building}/L${location.floor}/R${roomNumber}/${product.product_code}`;

  // 4. Siapkan array untuk menampung semua aset yang akan dibuat
  const assetsToCreate = [];
  
  // 5. Lakukan perulangan sebanyak 'quantity' untuk membuat data aset
  for (let i = 0; i < quantity; i++) {
    const nextSequence = assetCountInLocation + i + 1;
    const paddedSequence = String(nextSequence).padStart(3, '0');
    const newSerialNumber = `${prefix}${paddedSequence}`;

    const newAssetData = {
      ...commonData,
      product: productId,
      location: locationId,
      serial_number: newSerialNumber,
      condition: commonData.condition, // Sesuaikan dengan enum skema
    };
    assetsToCreate.push(newAssetData);
  }

  // 6. Gunakan `insertMany` untuk menyimpan semua aset dalam satu operasi efisien
  try {
    const createdAssets = await Asset.insertMany(assetsToCreate, { ordered: true });
    return createdAssets;
  } catch (error) {
    // Penanganan error duplikasi jika terjadi
    if (error.code === 11000) {
      const duplicateError = new Error(`Gagal membuat aset. Nomor Seri yang digenerate sudah ada.`);
      duplicateError.isDuplicate = true;
      throw duplicateError;
    }
    // Melemparkan error lainnya
    throw error;
  }
}