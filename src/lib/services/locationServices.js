// Lokasi: /lib/services/locationServices.js (Frontend)

import axios from "axios";

/**
 * Mengambil daftar lokasi dengan paginasi DAN FILTER.
 * @param {object} params - Opsi untuk query.
 * @param {number} params.page - Halaman saat ini.
 * @param {number} params.limit - Jumlah item per halaman.
 * @param {object} params.filters - Objek berisi filter (name, gedung, lantai).
 * @returns {Promise<object>} - Objek respons dari API.
 */
export async function getPaginatedLocations({ page = 1, limit = 10, filters = {} }) {
  try {
    // --- PERUBAHAN KUNCI DI SINI ---
    // Gabungkan pagination dan filter menjadi satu query string.
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...filters // Spread filter untuk menambahkan name, gedung, lantai jika ada
    }).toString();
    
    // Filter query yang kosong (cth: 'name=') agar tidak dikirim
    const cleanQueryParams = queryParams.replace(/[^=&]+=&/g, '').replace(/&$/, '');

    const response = await axios.get(`/api/locations?${cleanQueryParams}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching paginated locations:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Gagal mengambil data lokasi.");
  }
}

/**
 * Mengambil daftar semua lokasi untuk dropdown.
 * @returns {Promise<object>} - Objek respons dari API.
 */
export async function getAllLocationsForDropdown() {
  try {
    // Kita akan membuat API handler mengenali parameter 'all=true'
    const response = await axios.get('/api/locations?all=true');
    return response.data;
  } catch (error) {
    console.error("Error fetching all locations:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Gagal mengambil semua data lokasi.");
  }
}

/**
 * Mengirim data untuk membuat lokasi baru.
 * @param {object} locationData - Data lokasi yang akan dibuat.
 * @returns {Promise<object>} - Objek respons dari API.
 */
export async function createLocation(locationData) {
  try {
    const response = await axios.post('/api/locations', locationData);
    return response.data;
  } catch (error) {
    console.error("Error creating location:", error.response?.data || error.message);
    throw error.response?.data || new Error("Gagal membuat lokasi baru.");
  }
}


// ===================================================================================
//  OPERASI PADA DOKUMEN TUNGGAL (Berdasarkan ID)
// ===================================================================================

/**
 * Mengambil satu data lokasi spesifik berdasarkan ID-nya.
 * @param {string} id - ID lokasi.
 * @returns {Promise<object>} - Objek respons dari API.
 */
export async function getLocationById(id) {
    try {
        const response = await axios.get(`/api/locations/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching location with ID ${id}:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || `Gagal mengambil data lokasi dengan ID ${id}.`);
    }
}

/**
 * Mengirim data untuk memperbarui lokasi yang ada.
 * @param {string} id - ID lokasi yang akan diperbarui.
 * @param {object} locationData - Data baru untuk lokasi.
 * @returns {Promise<object>} - Objek respons dari API.
 */
export async function updateLocation(id, locationData) {
    try {
        const response = await axios.put(`/api/locations/${id}`, locationData);
        return response.data;
    } catch (error) {
        console.error(`Error updating location with ID ${id}:`, error.response?.data || error.message);
        throw error.response?.data || new Error(`Gagal memperbarui lokasi dengan ID ${id}.`);
    }
}

/**
 * Menghapus satu lokasi berdasarkan ID-nya.
 * @param {string} id - ID lokasi yang akan dihapus.
 * @returns {Promise<object>} - Objek respons dari API.
 */
export async function deleteLocation(id) {
    try {
        const response = await axios.delete(`/api/locations/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting location with ID ${id}:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || `Gagal menghapus lokasi dengan ID ${id}.`);
    }
}
