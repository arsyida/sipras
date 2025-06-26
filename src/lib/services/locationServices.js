import axios from "axios";

// ===================================================================================
//  OPERASI PADA KOLEKSI (Banyak Lokasi)
// ===================================================================================

/**
 * Mengambil daftar semua lokasi.
 * Ideal untuk digunakan pada tabel data atau dropdown.
 * @returns {Promise<object>} - Objek respons dari API, berisi { success, data: [...] }.
 */
export async function getAllLocations() {
    try {
        const response = await axios.get('/api/locations');
        return response.data;
    } catch (error) {
        console.error("Error fetching all locations:", error.response?.data || error.message);
        // Melemparkan error dengan pesan yang lebih konsisten
        throw new Error(error.response?.data?.message || "Gagal mengambil data lokasi.");
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
        // Melemparkan objek error dari backend agar bisa ditangani di form
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
        // Melemparkan error dengan pesan dari backend, misalnya jika lokasi masih digunakan
        throw new Error(error.response?.data?.message || `Gagal menghapus lokasi dengan ID ${id}.`);
    }
}
