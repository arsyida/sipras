// Lokasi: /lib/api/generateSerialNumber.js

import Asset from '@/models/Asset';
import Product from '@/models/Product';
import Location from '@/models/Location';
import connectToDatabase from '@/lib/database/db';
import mongoose from 'mongoose';

/**
 * Membuat serial number yang unik PER KOMBINASI LOKASI DAN KODE PRODUK, dan berurutan.
 * Format: 'G{gedung}/L{lantai}/R{ruang}/{kode_produk}{urutan_3_digit}'
 * Contoh: "GA/L3/R12/KUR001"
 * @param {string} productId - ID dari produk yang akan dibuatkan asetnya.
 * @param {string} locationId - ID dari lokasi tempat aset akan ditempatkan.
 * @param {object} [session=null] - (Opsional) Sesi transaksi Mongoose.
 * @returns {Promise<string>} - String serial number yang dihasilkan.
 * @throws {Error} - Melemparkan error jika produk atau lokasi tidak ditemukan.
 */
export async function generateSerialNumber(productId, locationId, session = null) { // Tambahkan session
  await connectToDatabase();

  try {
    const [product, location] = await Promise.all([
      Product.findById(productId).select('product_code').lean(),
      Location.findById(locationId).select('building floor name').lean()
    ]);

    if (!product || !product.product_code) {
      throw new Error(`Produk dengan ID ${productId} tidak ditemukan atau tidak memiliki product_code.`);
    }
    if (!location) {
      throw new Error(`Lokasi dengan ID ${locationId} tidak ditemukan.`);
    }

    const roomNameMatch = location.name.match(/^\d+/);
    const roomNumber = roomNameMatch ? roomNameMatch[0] : 'N/A';

    // Hitung aset yang sudah ada dengan LOKASI YANG SAMA DAN KODE PRODUK YANG SAMA
    const assetCountInLocationAndProductCode = await Asset.countDocuments({
      product: {
        $in: (await Product.find({ product_code: product.product_code }).select('_id').lean()).map(p => p._id)
      },
      location: new mongoose.Types.ObjectId(locationId)
    }, { session }); // <--- Lewatkan session di sini

    const nextSequence = assetCountInLocationAndProductCode + 1;
    const paddedSequence = nextSequence.toString().padStart(3, '0');

    const generatedSerialNumber = `G${location.building}/L${location.floor}/R${roomNumber}/${product.product_code}${paddedSequence}`;

    return generatedSerialNumber;

  } catch (error) {
    console.error("Error generating location-product_code based serial number:", error);
    throw error;
  }
}