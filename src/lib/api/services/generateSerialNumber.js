// Lokasi: /lib/api/assetService.js

import Asset from '@/models/Asset';
import Product from '@/models/Product';
import Location from '@/models/Location'; // Impor model Location
import connectToDatabase from '@/lib/database/db';
import mongoose from 'mongoose';

/**
 * Membuat serial number yang unik PER LOKASI dan berurutan.
 * Format: 'G{gedung}/L{lantai}/R{ruang}/{kode_produk}{urutan_3_digit}'
 * Contoh: "GA/L3/R12/KUR001"
 * @param {string} productId - ID dari produk yang akan dibuatkan asetnya.
 * @param {string} locationId - ID dari lokasi tempat aset akan ditempatkan.
 * @returns {Promise<string>} - String serial number yang dihasilkan.
 * @throws {Error} - Melemparkan error jika produk atau lokasi tidak ditemukan.
 */
export async function generateSerialNumber(productId, locationId) {
  await connectToDatabase();

  try {
    // 1. Ambil data Produk dan Lokasi secara bersamaan untuk efisiensi
    const [product, location] = await Promise.all([
      Product.findById(productId).select('product_code').lean(),
      Location.findById(locationId).select('building floor name').lean()
    ]);

    // Validasi data
    if (!product || !product.product_code) {
      throw new Error(`Produk dengan ID ${productId} tidak ditemukan atau tidak memiliki product_code.`);
    }
    if (!location) {
      throw new Error(`Lokasi dengan ID ${locationId} tidak ditemukan.`);
    }

    // 2. Ekstrak nomor ruang dari nama lokasi
    // Menggunakan regular expression untuk mengambil angka di awal string.
    // Contoh: "9 (Osis)" -> "9", "12 (Bendahara)" -> "12"
    const roomNameMatch = location.name.match(/^\d+/);
    const roomNumber = roomNameMatch ? roomNameMatch[0] : 'N/A'; // Fallback jika tidak ada angka

    // 3. Hitung aset dengan produk yang sama DI LOKASI YANG SAMA
    // Ini adalah kunci agar penomoran di-reset per ruangan.
    const assetCountInLocation = await Asset.countDocuments({ 
      product: new mongoose.Types.ObjectId(productId), 
      location: new mongoose.Types.ObjectId(locationId) 
    });

    // 4. Tentukan nomor urut berikutnya
    const nextSequence = assetCountInLocation + 1;
    const paddedSequence = nextSequence.toString().padStart(3, '0'); // Contoh: 1 -> "001"

    // 5. Gabungkan semua bagian menjadi serial number final
    const generatedSerialNumber = `G${location.building}/L${location.floor}/R${roomNumber}/${product.product_code}${paddedSequence}`;

    return generatedSerialNumber;

  } catch (error) {
    console.error("Error generating location-based serial number:", error);
    throw error;
  }
}
