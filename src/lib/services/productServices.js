// Lokasi: /lib/services/productServices.js (atau path yang sesuai di frontend Anda)

import axios from "axios";

// ===================================================================================
//  OPERASI PADA KOLEKSI (Banyak Produk)
// ===================================================================================

/**
 * Mengambil daftar produk dengan paginasi, sorting, dan filtering.
 * @param {object} params - Objek parameter untuk query.
 * @returns {Promise<object>} - Objek respons dari API.
 */
export async function getPaginatedProducts({ page = 1, limit = 10, sortBy = 'name', order = 'asc' }) {
    try {
        const queryParams = new URLSearchParams({ page, limit, sortBy, order }).toString();
        const response = await axios.get(`/api/products?${queryParams}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching paginated products:", error.response?.data || error.message);
        // Melemparkan objek error dari respons Axios jika ada, atau error baru
        throw error.response?.data || new Error("Gagal mengambil data produk.");
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
        throw error.response?.data || new Error("Gagal mengambil data produk untuk dropdown.");
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

// ... (Fungsi lainnya seperti createBulk, getById, update, delete juga bisa menggunakan pola error yang sama)

export async function createBulkProducts(productsData) {
    try {
        const response = await axios.post('/api/products/bulk', productsData);
        return response.data;
    } catch (error) {
        console.error("Error creating bulk products:", error.response?.data || error.message);
        throw error.response?.data || new Error("Gagal membuat produk secara massal.");
    }
}

export async function getProductById(id) {
    try {
        const response = await axios.get(`/api/products/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching product with ID ${id}:`, error.response?.data || error.message);
        throw error.response?.data || new Error(`Gagal mengambil data produk dengan ID ${id}.`);
    }
}

export async function updateProduct(id, productData) {
    try {
        const response = await axios.put(`/api/products/${id}`, productData);
        return response.data;
    } catch (error) {
        console.error(`Error updating product with ID ${id}:`, error.response?.data || error.message);
        throw error.response?.data || new Error(`Gagal memperbarui produk dengan ID ${id}.`);
    }
}

export async function deleteProduct(id) {
    try {
        const response = await axios.delete(`/api/products/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting product with ID ${id}:`, error.response?.data || error.message);
        throw error.response?.data || new Error(`Gagal menghapus produk dengan ID ${id}.`);
    }
}
