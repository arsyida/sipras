/**
 * @file Layanan terpusat untuk mengelola semua logika bisnis terkait Inventaris Habis Pakai.
 */

import { z } from 'zod';
import mongoose, { Types } from 'mongoose';
import connectToDatabase from '@/lib/database/db';

// Impor Model
import ConsumableProduct from '@/models/ConsumableProduct';
import ConsumableStock from '@/models/ConsumableStock';
import ConsumableLog from '@/models/ConsumableLog';
import Category from '@/models/Category';
import User from '@/models/User';
import Location from '@/models/Location';

// --- Skema Validasi Zod ---
const consumableProductSchema = z.object({
  product_code: z.string().trim().min(1, "Kode produk wajib diisi."),
  name: z.string().trim().min(1, "Nama produk wajib diisi."),
  category: z.string().refine((val) => Types.ObjectId.isValid(val), "ID Kategori tidak valid."),
});

const restockSchema = z.object({
  productId: z.string().refine((val) => Types.ObjectId.isValid(val)),
  unit: z.string().min(1, "Satuan wajib diisi."),
  quantityAdded: z.number().min(1),
  notes: z.string().trim().optional(),
  person_name: z.string().trim().min(1, "Nama penambah stok wajib diisi."),
  person_role: z.string().trim().optional(),
});

const usageSchema = z.object({
  stockItemId: z.string().refine((val) => Types.ObjectId.isValid(val)),
  quantityTaken: z.number().min(1),
  person_name: z.string().trim().min(1, "Nama pengambil wajib diisi."),
  person_role: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});
// -------------------------

// ===================================================================================
//  OPERASI PADA KATALOG PRODUK HABIS PAKAI
// ===================================================================================

export async function getPaginatedConsumableProducts({ page = 1, limit = 10, filters = {} }) {
    await connectToDatabase();
    const skip = (page - 1) * limit;
    const [data, totalItems] = await Promise.all([
        ConsumableProduct.find(filters).populate('category', 'name').sort({ name: 1, quantity: -1 }).skip(skip).limit(limit).lean(),
        ConsumableProduct.countDocuments(filters)
    ]);
    return { data, totalItems };
}

export async function getAllConsumableProductsForDropdown() {
    await connectToDatabase();
    return await ConsumableProduct.find({}).select('name product_code').sort({ name: 1 }).lean();
}

export async function createConsumableProduct(data) {
    const validation = consumableProductSchema.safeParse(data);
    if (!validation.success) {
        throw { isValidationError: true, errors: validation.error.flatten().fieldErrors, message: "Input tidak valid." };
    }
    await connectToDatabase();
    try {
        return await ConsumableProduct.create(validation.data);
    } catch (error) {
        if (error.code === 11000) {
            throw { isDuplicate: true, message: `Produk dengan nama atau kode yang sama sudah ada.` };
        }
        throw error;
    }
}

export async function getConsumableProductById(id) {
    await connectToDatabase();
    const product = await ConsumableProduct.findById(id).populate('category', 'name').lean();
    if (!product) {
        throw { isNotFound: true, message: 'Produk habis pakai tidak ditemukan.' };
    }
    return product;
}

export async function updateConsumableProductById(id, data) {
    const validation = consumableProductSchema.partial().safeParse(data);
    if (!validation.success) {
        throw { isValidationError: true, errors: validation.error.flatten().fieldErrors, message: "Input tidak valid." };
    }
    await connectToDatabase();
    try {
        const updatedProduct = await ConsumableProduct.findByIdAndUpdate(id, validation.data, { new: true, runValidators: true }).lean();
        if (!updatedProduct) {
            throw { isNotFound: true, message: 'Produk tidak ditemukan untuk diperbarui.' };
        }
        return updatedProduct;
    } catch (error) {
        if (error.code === 11000) {
            throw { isDuplicate: true, message: `Produk dengan nama atau kode yang sama sudah ada.` };
        }
        throw error;
    }
}

export async function deleteConsumableProductById(id) {
    await connectToDatabase();
    const stockCount = await ConsumableStock.countDocuments({ product: id });
    if (stockCount > 0) {
        throw { isConflict: true, message: `Produk tidak dapat dihapus karena sudah memiliki data stok.` };
    }
    const deletedProduct = await ConsumableProduct.findByIdAndDelete(id);
    if (!deletedProduct) {
        throw { isNotFound: true, message: 'Produk tidak ditemukan untuk dihapus.' };
    }
}

// ===================================================================================
//  OPERASI PADA STOK & LOG
// ===================================================================================

// ===================================================================================
//  OPERASI PADA STOK & LOG
// ===================================================================================

export async function getPaginatedConsumableStock({ page = 1, limit = 10, filters = {} }) {
    await connectToDatabase();
    const skip = (page - 1) * limit;
    const [data, totalItems] = await Promise.all([
      ConsumableStock.find(filters)
        .populate({
          path: 'product',
          model: ConsumableProduct,
          select: 'name product_code measurement_unit'
        })
        .sort({ 'product.name': 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ConsumableStock.countDocuments(filters)
    ]);
    return { data, totalItems };
}

/**
 * [BARU] Mengambil detail satu item stok berdasarkan ID-nya.
 * @param {string} id - ID dari dokumen ConsumableStock.
 * @returns {Promise<object>} Dokumen stok yang ditemukan.
 */
export async function getConsumableStockById(id) {
    await connectToDatabase();
    const stockItem = await ConsumableStock.findById(id)
      .populate({
        path: 'product',
        model: ConsumableProduct,
        select: 'name measurement_unit',
      })
      .lean();

    if (!stockItem) {
        throw { isNotFound: true, message: 'Item stok tidak ditemukan.' };
    }
    return stockItem;
}

export async function getPaginatedConsumableLogs({ page = 1, limit = 10, filters = {} }) {
    await connectToDatabase();
    const skip = (page - 1) * limit;
    const [data, totalItems] = await Promise.all([
      ConsumableLog.find(filters)
        .populate({ path: 'user', select: 'name' })
        .populate({
          path: 'stock_item',
          model: ConsumableStock,
          populate: { path: 'product', model: ConsumableProduct, select: 'name' }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ConsumableLog.countDocuments(filters)
    ]);
    return { data, totalItems };
}

export async function recordRestock(data, userId) {
    const validation = restockSchema.safeParse(data);
    if (!validation.success) {
        throw { isValidationError: true, errors: validation.error.flatten().fieldErrors, message: "Input tidak valid." };
    }
    const { productId, quantityAdded, unit, notes, person_name, person_role } = validation.data;

    const dbSession = await mongoose.startSession();
    try {
        let result;
        await dbSession.withTransaction(async () => {
            let stockItem = await ConsumableStock.findOne({ product: productId }).session(dbSession);
            if (!stockItem) {
                stockItem = new ConsumableStock({ product: productId, quantity: 0, unit: unit });
            }
            stockItem.quantity += quantityAdded;
            await stockItem.save({ session: dbSession });

            const newLog = await ConsumableLog.create([{
                stock_item: stockItem._id,
                user: userId,
                transaction_type: 'penambahan',
                quantity_changed: quantityAdded,
                person_name,
                person_role,
                notes,
            }], { session: dbSession });
            result = { stockItem, log: newLog[0] };
        });
        await dbSession.endSession();
        return result;
    } catch (error) {
        await dbSession.endSession();
        throw error;
    }
}

export async function recordUsage(data, userId) {
    const validation = usageSchema.safeParse(data);
    if (!validation.success) {
        throw { isValidationError: true, errors: validation.error.flatten().fieldErrors, message: "Input tidak valid." };
    }
    const { stockItemId, quantityTaken, notes, person_name, person_role } = validation.data;
    
    const dbSession = await mongoose.startSession();
    try {
        let result;
        await dbSession.withTransaction(async () => {
            const stockItem = await ConsumableStock.findById(stockItemId).session(dbSession);
            if (!stockItem) throw new Error(`Stok item tidak ditemukan.`);
            if (stockItem.quantity < quantityTaken) throw new Error(`Stok tidak mencukupi. Stok saat ini: ${stockItem.quantity}.`);
            stockItem.quantity -= quantityTaken;
            await stockItem.save({ session: dbSession });

            const newLog = await ConsumableLog.create([{
                stock_item: stockItem._id,
                user: userId,
                person_name,
                person_role,
                transaction_type: 'pengambilan',
                quantity_changed: quantityTaken,
                notes,
            }], { session: dbSession });
            result = { stockItem, log: newLog[0] };
        });
        await dbSession.endSession();
        return result;
    } catch (error) {
        await dbSession.endSession();
        throw error;
    }
}
