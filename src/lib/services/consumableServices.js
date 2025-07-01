// Lokasi: /lib/services/consumableServices.js (Frontend)

import axios from "axios";

// ===================================================================================
//  OPERASI PADA KATALOG PRODUK HABIS PAKAI
// ===================================================================================

/**
 * Mengambil daftar produk habis pakai dengan paginasi dan filter.
 * @param {object} params - Opsi untuk query.
 * @returns {Promise<object>} - Objek respons dari API.
 */
export async function getPaginatedConsumableProducts({ page = 1, limit = 10, filters = {} }) {
  try {
    const queryParams = new URLSearchParams({ page, limit, ...filters }).toString();
    const cleanQueryParams = queryParams.replace(/[^=&]+=&/g, '').replace(/&$/, '');
    const response = await axios.get(`/api/consumable-products?${cleanQueryParams}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching paginated consumable products:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Gagal mengambil data produk habis pakai.");
  }
}

/**
 * Mengambil SEMUA produk habis pakai tanpa paginasi untuk dropdown.
 * @returns {Promise<object>} - Objek respons dari API.
 */
export async function getAllConsumableProductsForDropdown() {
  try {
    const response = await axios.get('/api/consumable-products?all=true');
    return response.data;
  } catch (error) {
    console.error("Error fetching all consumable products for dropdown:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Gagal mengambil data produk untuk dropdown.");
  }
}

/**
 * Mengirim data untuk membuat produk habis pakai baru.
 * @param {object} productData - Data produk yang akan dibuat.
 * @returns {Promise<object>} - Objek respons dari API.
 */
export async function createConsumableProduct(productData) {
  try {
    const response = await axios.post('/api/consumable-products', productData);
    return response.data;
  } catch (error) {
    console.error("Error creating consumable product:", error.response?.data || error.message);
    throw error.response?.data || new Error("Gagal membuat produk habis pakai baru.");
  }
}

/**
 * Mengambil satu data produk habis pakai spesifik berdasarkan ID-nya.
 * @param {string} id - ID produk.
 * @returns {Promise<object>} - Objek respons dari API.
 */
export async function getConsumableProductById(id) {
    try {
        const response = await axios.get(`/api/consumable-products/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching consumable product with ID ${id}:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || `Gagal mengambil data produk dengan ID ${id}.`);
    }
}

/**
 * Mengirim data untuk memperbarui produk habis pakai yang ada.
 * @param {string} id - ID produk yang akan diperbarui.
 * @param {object} productData - Data baru untuk produk.
 * @returns {Promise<object>} - Objek respons dari API.
 */
export async function updateConsumableProduct(id, productData) {
    try {
        const response = await axios.put(`/api/consumable-products/${id}`, productData);
        return response.data;
    } catch (error) {
        console.error(`Error updating consumable product with ID ${id}:`, error.response?.data || error.message);
        throw error.response?.data || new Error(`Gagal memperbarui produk dengan ID ${id}.`);
    }
}

/**
 * Menghapus satu produk habis pakai berdasarkan ID-nya.
 * @param {string} id - ID produk yang akan dihapus.
 * @returns {Promise<object>} - Objek respons dari API.
 */
export async function deleteConsumableProduct(id) {
    try {
        const response = await axios.delete(`/api/consumable-products/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting consumable product with ID ${id}:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || `Gagal menghapus produk dengan ID ${id}.`);
    }
}


// ===================================================================================
//  OPERASI PADA STOK & LOG
// ===================================================================================

/**
 * Mengambil daftar stok barang habis pakai dengan paginasi dan filter.
 * @param {object} params - Opsi untuk query.
 * @returns {Promise<object>} - Objek respons dari API.
 */
export async function getPaginatedConsumableStock({ page = 1, limit = 10, filters = {} }) {
  try {
    const queryParams = new URLSearchParams({ page, limit, ...filters }).toString();
    const cleanQueryParams = queryParams.replace(/[^=&]+=&/g, '').replace(/&$/, '');
    const response = await axios.get(`/api/consumables/stock?${cleanQueryParams}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching paginated consumable stock:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Gagal mengambil data stok barang habis pakai.");
  }
}
/**
 * [BARU] Mengambil satu data item stok spesifik berdasarkan ID-nya.
 * @param {string} id - ID item stok.
 * @returns {Promise<object>} - Objek respons dari API.
 */
export async function getConsumableStockById(id) {
    try {
        const response = await axios.get(`/api/consumables/stock/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching stock item with ID ${id}:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || `Gagal mengambil data stok dengan ID ${id}.`);
    }
}


/**
 * Mengambil riwayat transaksi (log) dengan paginasi dan filter.
 * @param {object} params - Opsi untuk query.
 * @returns {Promise<object>} - Objek respons dari API.
 */
export async function getPaginatedConsumableLogs({ page = 1, limit = 10, filters = {} }) {
    try {
        const queryParams = new URLSearchParams({ page, limit, ...filters }).toString();
        const cleanQueryParams = queryParams.replace(/[^=&]+=&/g, '').replace(/&$/, '');
        const response = await axios.get(`/api/consumables/log?${cleanQueryParams}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching paginated consumable logs:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Gagal mengambil riwayat transaksi.");
    }
}

/**
 * Mengirim data untuk mencatat penambahan stok (restock).
 * @param {object} restockData - Data untuk penambahan stok.
 * @returns {Promise<object>} - Objek respons dari API.
 */
export async function recordRestock(restockData) {
  try {
    const response = await axios.post('/api/consumables/restock', restockData);
    return response.data;
  } catch (error) {
    console.error("Error recording restock:", error.response?.data || error.message);
    throw error.response?.data || new Error("Gagal mencatat penambahan stok.");
  }
}

/**
 * Mengirim data untuk mencatat pengambilan/pemakaian stok.
 * @param {object} usageData - Data untuk pengambilan stok.
 * @returns {Promise<object>} - Objek respons dari API.
 */
export async function recordUsage(usageData) {
  try {
    const response = await axios.post('/api/consumables/usage', usageData);
    return response.data;
  } catch (error) {
    console.error("Error recording usage:", error.response?.data || error.message);
    throw error.response?.data || new Error("Gagal mencatat pengambilan stok.");
  }
}
