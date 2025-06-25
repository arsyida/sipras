// Lokasi: /lib/api/assetService.js

import Asset from '@/models/Asset';
import Product from '@/models/Product';
import connectToDatabase from '@/lib/database/db';

/**
 * Membuat asset_tag yang unik dan berurutan secara otomatis.
 * Format: [KODE_PRODUK]-[NOMOR_URUT_4_DIGIT]
 * Contoh: "KUR-0001", "LTP-0015"
 * @param {string} productId - ID dari produk yang akan dibuatkan asetnya.
 * @returns {Promise<string>} - String asset_tag yang dihasilkan.
 * @throws {Error} - Melemparkan error jika produk tidak ditemukan.
 */
export async function generateAssetTag(productId) {
  await connectToDatabase();

  try {
    // 1. Ambil kode produk dari koleksi Product berdasarkan ID-nya.
    // .lean() digunakan untuk performa query yang lebih cepat karena hasilnya adalah objek JavaScript biasa.
    const product = await Product.findById(productId).select('product_code').lean();

    if (!product || !product.product_code) {
      // Jika produk tidak ditemukan, proses tidak bisa dilanjutkan.
      throw new Error(`Produk dengan ID ${productId} tidak ditemukan atau tidak memiliki product_code.`);
    }

    const productCode = product.product_code; // Misal: "KUR"

    // 2. Hitung ada berapa banyak aset yang sudah ada untuk produk ini.
    const assetCount = await Asset.countDocuments({ product: productId });

    // 3. Tentukan nomor urut berikutnya.
    const nextSequence = assetCount + 1;

    // 4. Format nomor urut menjadi 4 digit dengan menambahkan nol di depan jika perlu.
    // Contoh: 1 -> "0001", 15 -> "0015", 123 -> "0123"
    const paddedSequence = nextSequence.toString().padStart(4, '0');

    // 5. Gabungkan menjadi asset_tag yang final.
    const generatedTag = `${productCode}-${paddedSequence}`; // Hasil: "KUR-0001"

    return generatedTag;

  } catch (error) {
    console.error("Error generating asset tag:", error);
    // Melemparkan kembali error agar bisa ditangani oleh blok try-catch di API Route.
    throw error;
  }
}
