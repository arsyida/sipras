// Lokasi: /lib/services/assetServices.js (Frontend)

import axios from "axios";

// ===================================================================================
//  OPERASI PADA KOLEKSI (Banyak Aset)
// ===================================================================================

/**
 * Mengambil daftar aset dengan paginasi dan filter.
 * @param {object} params - Opsi untuk query.
 * @param {number} params.page - Halaman saat ini.
 * @param {number} params.limit - Jumlah item per halaman.
 * @param {object} params.filters - Objek berisi filter (serial_number, location, product, dll).
 * @returns {Promise<object>} - Objek respons dari API.
 */
export async function getPaginatedAssets({ page = 1, limit = 10, filters = {} }) {
  try {
    // Gabungkan pagination dan filter menjadi satu query string.
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...filters
    }).toString();
    
    // Filter query yang kosong agar tidak dikirim (misal: 'name=')
    const cleanQueryParams = queryParams.replace(/[^=&]+=&/g, '').replace(/&$/, '');

    const response = await axios.get(`/api/assets?${cleanQueryParams}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching paginated assets:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Gagal mengambil data aset.");
  }
}

/**
 * Mengirim data untuk mendaftarkan satu aset baru.
 * @param {object} assetData - Data aset yang akan dibuat.
 * @returns {Promise<object>} - Objek respons dari API.
 */
export async function createAsset(assetData) {
  try {
    const response = await axios.post('/api/assets', assetData);
    return response.data;
  } catch (error) {
    console.error("Error creating asset:", error.response?.data || error.message);
    throw error.response?.data || new Error("Gagal membuat aset baru.");
  }
}

/**
 * Mengirim array data untuk membuat banyak aset sekaligus per ruangan.
 * @param {object} bulkData - Objek berisi locationId dan array items.
 * @returns {Promise<object>} - Objek respons dari API.
 */
export async function createBulkAssetsByRoom(bulkData) {
    try {
        const response = await axios.post('/api/assets/bulk-by-room', bulkData);
        return response.data;
    } catch (error) {
        console.error("Error creating bulk assets by room:", error.response?.data || error.message);
        throw error.response?.data || new Error("Gagal membuat aset secara massal per ruangan.");
    }
}


// ===================================================================================
//  OPERASI PADA DOKUMEN TUNGGAL (Berdasarkan ID)
// ===================================================================================

/**
 * Mengambil satu data aset spesifik berdasarkan ID-nya.
 * @param {string} id - ID aset.
 * @returns {Promise<object>} - Objek respons dari API.
 */
export async function getAssetById(id) {
    try {
        const response = await axios.get(`/api/assets/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching asset with ID ${id}:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || `Gagal mengambil data aset dengan ID ${id}.`);
    }
}

/**
 * Mengirim data untuk memperbarui aset yang ada.
 * @param {string} id - ID aset yang akan diperbarui.
 * @param {object} assetData - Data baru untuk aset.
 * @returns {Promise<object>} - Objek respons dari API.
 */
export async function updateAsset(id, assetData) {
    try {
        const response = await axios.put(`/api/assets/${id}`, assetData);
        return response.data;
    } catch (error) {
        console.error(`Error updating asset with ID ${id}:`, error.response?.data || error.message);
        throw error.response?.data || new Error(`Gagal memperbarui aset dengan ID ${id}.`);
    }
}

/**
 * Menghapus satu aset berdasarkan ID-nya.
 * @param {string} id - ID aset yang akan dihapus.
 * @returns {Promise<object>} - Objek respons dari API.
 */
export async function deleteAsset(id) {
    try {
        const response = await axios.delete(`/api/assets/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting asset with ID ${id}:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || `Gagal menghapus aset dengan ID ${id}.`);
    }
}
