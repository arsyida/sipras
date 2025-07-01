// Lokasi: /lib/services/categoryServices.js (Frontend)

import axios from "axios";

// ===================================================================================
//  OPERASI PADA KOLEKSI (Banyak Kategori)
// ===================================================================================

/**
 * Mengambil daftar brand dengan paginasi dan filter.
 * @param {object} params - Opsi untuk query.
 * @param {number} params.page - Halaman saat ini.
 * @param {number} params.limit - Jumlah item per halaman.
 * @param {object} params.filters - Objek berisi filter (misalnya, { name: '...' }).
 * @returns {Promise<object>} - Objek respons dari API.
 */
export async function getPaginatedCategories({ page = 1, limit = 10, filters = {} }) {
  try {
    // Gabungkan pagination dan filter menjadi satu query string.
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...filters
    }).toString();
    
    // Filter query yang kosong agar tidak dikirim (misal: 'name=')
    const cleanQueryParams = queryParams.replace(/[^=&]+=&/g, '').replace(/&$/, '');

    const response = await axios.get(`/api/categories?${cleanQueryParams}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching paginated categories:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Gagal mengambil data kategori.");
  }
}

/**
 * Mengambil SEMUA kategori tanpa paginasi untuk dropdown.
 * @returns {Promise<object>} - Objek respons dari API.
 */
export async function getAllCategoriesForDropdown() {
  try {
    const response = await axios.get('/api/categories?all=true');
    return response.data;
  } catch (error) {
    console.error("Error fetching all categories for dropdown:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Gagal mengambil data kategori untuk dropdown.");
  }
}

/**
 * Mengirim data untuk membuat kategori baru.
 * @param {object} categoryData - Data kategori yang akan dibuat.
 * @returns {Promise<object>} - Objek respons dari API.
 */
export async function createCategory(categoryData) {
  try {
    const response = await axios.post('/api/categories', categoryData);
    return response.data;
  } catch (error) {
    console.error("Error creating category:", error.response?.data || error.message);
    throw error.response?.data || new Error("Gagal membuat kategori baru.");
  }
}


// ===================================================================================
//  OPERASI PADA DOKUMEN TUNGGAL (Berdasarkan ID)
// ===================================================================================

/**
 * Mengambil satu data kategori spesifik berdasarkan ID-nya.
 * @param {string} id - ID kategori.
 * @returns {Promise<object>} - Objek respons dari API.
 */
export async function getCategoryById(id) {
    try {
        const response = await axios.get(`/api/categories/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching category with ID ${id}:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || `Gagal mengambil data kategori dengan ID ${id}.`);
    }
}

/**
 * Mengirim data untuk memperbarui kategori yang ada.
 * @param {string} id - ID kategori yang akan diperbarui.
 * @param {object} categoryData - Data baru untuk kategori.
 * @returns {Promise<object>} - Objek respons dari API.
 */
export async function updateCategory(id, categoryData) {
    try {
        const response = await axios.put(`/api/categories/${id}`, categoryData);
        return response.data;
    } catch (error) {
        console.error(`Error updating category with ID ${id}:`, error.response?.data || error.message);
        throw error.response?.data || new Error(`Gagal memperbarui kategori dengan ID ${id}.`);
    }
}

/**
 * Menghapus satu kategori berdasarkan ID-nya.
 * @param {string} id - ID kategori yang akan dihapus.
 * @returns {Promise<object>} - Objek respons dari API.
 */
export async function deleteCategory(id) {
    try {
        const response = await axios.delete(`/api/categories/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting category with ID ${id}:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || `Gagal menghapus kategori dengan ID ${id}.`);
    }
}
