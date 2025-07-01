// Lokasi: /lib/services/productServices.js (Frontend)

import axios from "axios";

// ===================================================================================
//  OPERASI PADA KOLEKSI (Banyak Produk)
// ===================================================================================

/**
 * Mengambil daftar produk dengan paginasi dan filter.
 * @param {object} params - Opsi untuk query.
 * @param {number} params.page - Halaman saat ini.
 * @param {number} params.limit - Jumlah item per halaman.
 * @param {object} params.filters - Objek berisi filter (name, brand, category).
 * @returns {Promise<object>} - Objek respons dari API.
 */
export async function getPaginatedProducts({ page = 1, limit = 10, filters = {} }) {
  try {
    // Gabungkan pagination dan filter menjadi satu query string.
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...filters // Menambahkan name, brand, dan category jika ada
    }).toString();
    
    // Filter query yang kosong (cth: 'name=') agar tidak dikirim
    const cleanQueryParams = queryParams.replace(/[^=&]+=&/g, '').replace(/&$/, '');

    const response = await axios.get(`/api/products?${cleanQueryParams}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching paginated products:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Gagal mengambil data produk.");
  }
}

/**
 * Mengambil SEMUA produk tanpa paginasi untuk dropdown.
 * @returns {Promise<object>} - Objek respons dari API.
 */
export async function getAllProductsForDropdown() {
  try {
    const response = await axios.get('/api/products?all=true');
    return response.data;
  } catch (error) {
    console.error("Error fetching all products for dropdown:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Gagal mengambil data produk untuk dropdown.");
  }
}

/**
 * Mengirim data untuk membuat produk baru.
 * @param {object} productData - Data produk yang akan dibuat.
 * @returns {Promise<object>} - Objek respons dari API.
 */
export async function createProduct(productData) {
  try {
    const response = await axios.post('/api/products', productData);
    return response.data;
  } catch (error) {
    console.error("Error creating product:", error.response?.data || error.message);
    throw error.response?.data || new Error("Gagal membuat produk baru.");
  }
}

/**
 * Mengirim array data untuk membuat banyak produk sekaligus.
 * @param {Array<object>} productsData - Array data produk.
 * @returns {Promise<object>} - Objek respons dari API.
 */
export async function createBulkProducts(productsData) {
    try {
        const response = await axios.post('/api/products/bulk', productsData);
        return response.data;
    } catch (error) {
        console.error("Error creating bulk products:", error.response?.data || error.message);
        throw error.response?.data || new Error("Gagal membuat produk secara massal.");
    }
}


// ===================================================================================
//  OPERASI PADA DOKUMEN TUNGGAL (Berdasarkan ID)
// ===================================================================================

/**
 * Mengambil satu data produk spesifik berdasarkan ID-nya.
 * @param {string} id - ID produk.
 * @returns {Promise<object>} - Objek respons dari API.
 */
export async function getProductById(id) {
    try {
        const response = await axios.get(`/api/products/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching product with ID ${id}:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || `Gagal mengambil data produk dengan ID ${id}.`);
    }
}

/**
 * Mengirim data untuk memperbarui produk yang ada.
 * @param {string} id - ID produk yang akan diperbarui.
 * @param {object} productData - Data baru untuk produk.
 * @returns {Promise<object>} - Objek respons dari API.
 */
export async function updateProduct(id, productData) {
    try {
        const response = await axios.put(`/api/products/${id}`, productData);
        return response.data;
    } catch (error) {
        console.error(`Error updating product with ID ${id}:`, error.response?.data || error.message);
        throw error.response?.data || new Error(`Gagal memperbarui produk dengan ID ${id}.`);
    }
}

/**
 * Menghapus satu produk berdasarkan ID-nya.
 * @param {string} id - ID produk yang akan dihapus.
 * @returns {Promise<object>} - Objek respons dari API.
 */
export async function deleteProduct(id) {
    try {
        const response = await axios.delete(`/api/products/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting product with ID ${id}:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || `Gagal menghapus produk dengan ID ${id}.`);
    }
}
