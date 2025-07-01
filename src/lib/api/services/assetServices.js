/**
 * @file Layanan terpusat untuk mengelola semua logika bisnis terkait Aset.
 */

import { z } from 'zod';
import connectToDatabase from '@/lib/database/db';
import Asset from '@/models/Asset';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Brand from '@/models/Brand';
import Location from '@/models/Location';
import { generateSerialNumber } from '@/lib/api/services/generateSerialNumber'; // Asumsi utilitas dipisah
import mongoose, { Types } from 'mongoose';

// --- Skema Validasi Zod ---

// Skema untuk mendaftarkan SATU aset baru
const assetRegistrationSchema = z.object({
  product: z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: "ID Produk tidak valid.",
  }),
  location: z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: "ID Lokasi tidak valid.",
  }),
  condition: z.enum(['Baik', 'Rusak', 'Kurang Baik']).default('Baik'),
  purchase_date: z.coerce.date().optional(),
  estimated_price: z.number().optional(),
  attributes: z.record(z.any()).optional(),
});

// Skema untuk form pendaftaran BANYAK aset
const assetBulkSchema = z.object({
  product: z.string().min(1, "Produk harus dipilih."),
  location: z.string().min(1, "Lokasi harus dipilih."),
  purchase_date: z.coerce.date().optional(),
  quantity: z.number().int().min(1, "Jumlah harus minimal 1."),
  estimated_price: z.number().min(0, "Harga harus angka positif.").optional(),
  condition: z.enum(['Baik', 'Rusak', 'Kurang Baik']).default('baik'),
  attributes: z.record(z.any()).optional(),
});

// Skema untuk memperbarui aset.
const assetUpdateSchema = assetRegistrationSchema.partial();


// ===================================================================================
//  OPERASI PADA KOLEKSI
// ===================================================================================

/**
 * Mengambil daftar aset dengan filter, sorting, dan paginasi.
 * @param {object} options - Opsi untuk query.
 * @returns {Promise<{data: Array<object>, totalItems: number}>}
 */
export async function getPaginatedAssets({ page = 1, limit = 10, filters = {} }) {
  await connectToDatabase();
  const skip = (page - 1) * limit;

  const [data, totalItems] = await Promise.all([
    Asset.find(filters)
      .populate({
        path: 'product',
        model: Product,
        // PERBAIKAN: Menambahkan 'category' dan 'brand' ke select agar nested populate bisa bekerja
        select: 'name product_code category  measurement_unit', 
        populate: [
            { path: 'category', model: Category, select: 'name' },
            { path: 'brand', model: Brand, select: 'name' }
        ]
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

  return { data, totalItems };
}

/**
 * Mendaftarkan beberapa aset sekaligus berdasarkan quantity.
 * @param {object} data - Data dari form bulk.
 * @returns {Promise<Array>} Array dari dokumen aset yang baru dibuat.
 */
export async function registerBulkAssets(data) {
  const validation = assetBulkSchema.safeParse(data);
  if (!validation.success) {
    const validationError = new Error('Input tidak valid.');
    validationError.isValidationError = true;
    validationError.errors = validation.error.flatten().fieldErrors;
    throw validationError;  
  }
  
  const { quantity, product: productId, location: locationId, ...commonData } = validation.data;
  
  await connectToDatabase();

  const [product, location, assetCountInLocation] = await Promise.all([
    Product.findById(productId).select('product_code').lean(),
    Location.findById(locationId).select('building floor name').lean(),
    Asset.countDocuments({ 
      product: new mongoose.Types.ObjectId(productId), 
      location: new mongoose.Types.ObjectId(locationId) 
    })
  ]);

  if (!product || !product.product_code) throw new Error(`Produk dengan ID ${productId} tidak valid.`);
  if (!location) throw new Error(`Lokasi dengan ID ${locationId} tidak valid.`);

  const roomNameMatch = location.name.match(/^\d+/);
  const roomNumber = roomNameMatch ? roomNameMatch[0] : 'N/A';
  const prefix = `G${location.building}/L${location.floor}/R${roomNumber}/${product.product_code}`;

  const assetsToCreate = [];
  
  for (let i = 0; i < quantity; i++) {
    const nextSequence = assetCountInLocation + i + 1;
    const paddedSequence = String(nextSequence).padStart(3, '0');
    const newSerialNumber = `${prefix}${paddedSequence}`;

    assetsToCreate.push({
      ...commonData,
      product: productId,
      location: locationId,
      serial_number: newSerialNumber,
    });
  }

  try {
    const createdAssets = await Asset.insertMany(assetsToCreate, { ordered: true });
    return createdAssets;
  } catch (error) {
    if (error.code === 11000) {
      const duplicateError = new Error(`Gagal membuat aset. Nomor Seri yang digenerate sudah ada.`);
      duplicateError.isDuplicate = true;
      throw duplicateError;
    }
    throw error;
  }
}

// ===================================================================================
//  OPERASI PADA DOKUMEN TUNGGAL
// ===================================================================================

/**
 * Mengambil detail satu aset berdasarkan ID-nya.
 * @param {string} id - ID dari aset.
 * @returns {Promise<object>} Dokumen aset yang ditemukan.
 */
export async function getAssetById(id) {
    await connectToDatabase();
    const asset = await Asset.findById(id)
      .populate({
        path: 'product',
        model: Product,
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
 * Menghapus satu aset berdasarkan ID-nya.
 * @param {string} id - ID dari aset yang akan dihapus.
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
