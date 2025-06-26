// Lokasi: /lib/services/brandServices.js (atau path yang sesuai di frontend Anda)

import axios from "axios";

// ===================================================================================
//  OPERASI PADA KOLEKSI (Banyak Brand)
// ===================================================================================

/**
 * Mengambil daftar brand dengan paginasi dan filter.
 * @param {object} params - Opsi untuk query.
 * @returns {Promise<object>} - Objek respons dari API.
 */
export async function getPaginatedBrands({ page = 1, limit = 10, filters = {} }) {
    try {
        const queryParams = new URLSearchParams({ page, limit, ...filters }).toString();
        const response = await axios.get(`/api/brands?${queryParams}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching paginated brands:", error.response?.data || error.message);
        throw error.response?.data || new Error("Gagal mengambil data merk.");
    }
}

/**
 * Mengambil SEMUA brand tanpa paginasi untuk dropdown.
 * @returns {Promise<object>} - Objek respons dari API.
 */
export async function getAllBrandsForDropdown() {
    try {
        const response = await axios.get('/api/brands?all=true');
        return response.data;
    } catch (error) {
        console.error("Error fetching all brands for dropdown:", error.response?.data || error.message);
        throw error.response?.data || new Error("Gagal mengambil data merk untuk dropdown.");
    }
}

/**
 * Mengirim data untuk membuat brand baru.
 * @param {object} brandData - Data brand yang akan dibuat.
 * @returns {Promise<object>} - Objek respons dari API.
 */
export async function createBrand(brandData) {
    try {
        const response = await axios.post('/api/brands', brandData);
        return response.data;
    } catch (error) {
        console.error("Error creating brand:", error.response?.data || error.message);
        throw error.response?.data || new Error("Gagal membuat merk baru.");
    }
}


// ===================================================================================
//  OPERASI PADA DOKUMEN TUNGGAL (Berdasarkan ID)
// ===================================================================================

/**
 * Mengambil satu data brand spesifik berdasarkan ID-nya.
 * @param {string} id - ID brand.
 * @returns {Promise<object>} - Objek respons dari API.
 */
export async function getBrandById(id) {
    try {
        const response = await axios.get(`/api/brands/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching brand with ID ${id}:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || `Gagal mengambil data merk dengan ID ${id}.`);
    }
}

/**
 * Mengirim data untuk memperbarui brand yang ada.
 * @param {string} id - ID brand yang akan diperbarui.
 * @param {object} brandData - Data baru untuk brand.
 * @returns {Promise<object>} - Objek respons dari API.
 */
export async function updateBrand(id, brandData) {
    try {
        const response = await axios.put(`/api/brands/${id}`, brandData);
        return response.data;
    } catch (error) {
        console.error(`Error updating brand with ID ${id}:`, error.response?.data || error.message);
        throw error.response?.data || new Error(`Gagal memperbarui merk dengan ID ${id}.`);
    }
}

/**
 * Menghapus satu brand berdasarkan ID-nya.
 * @param {string} id - ID brand yang akan dihapus.
 * @returns {Promise<object>} - Objek respons dari API.
 */
export async function deleteBrand(id) {
    try {
        const response = await axios.delete(`/api/brands/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting brand with ID ${id}:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || `Gagal menghapus merk dengan ID ${id}.`);
    }
}
