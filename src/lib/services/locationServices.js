import axios from "axios";

// ===================================================================================
//  OPERASI PADA KOLEKSI (Banyak Lokasi)
// ===================================================================================

/**
 * Mengambil daftar lokasi dengan paginasi.
 * @param {object} params - Opsi untuk query, seperti { page, limit }.
 * @returns {Promise<object>} - Objek respons dari API, termasuk data dan info paginasi.
 */
export async function getPaginatedLocations({ page = 1, limit = 20 }) {
    try {
        const queryParams = new URLSearchParams({ page, limit }).toString();
        const response = await axios.get(`/api/locations?${queryParams}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching paginated locations:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Gagal mengambil data lokasi.");
    }
}

/**
 * Mengambil daftar semua lokasi untuk dropdown.
 * @returns {Promise<object>} - Objek respons dari API, berisi { success, data: [...] }.
 */
export async function getAllLocations() {
    try {
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
