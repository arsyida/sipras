// Lokasi: /lib/services/categoryServices.js

import axios from "axios";

export async function getPaginatedCategories({ page = 1, limit = 10, filters = {} }) {
    try {
        const queryParams = new URLSearchParams({ page, limit, ...filters }).toString();
        const response = await axios.get(`/api/categories?${queryParams}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || new Error("Gagal mengambil data kategori.");
    }
}

export async function getAllCategoriesForDropdown() {
    try {
        const response = await axios.get('/api/categories?all=true');
        return response.data;
    } catch (error) {
        throw error.response?.data || new Error("Gagal mengambil data kategori untuk dropdown.");
    }
}

export async function createCategory(categoryData) {
    try {
        const response = await axios.post('/api/categories', categoryData);
        return response.data;
    } catch (error) {
        throw error.response?.data || new Error("Gagal membuat kategori baru.");
    }
}

export async function getCategoryById(id) {
    try {
        const response = await axios.get(`/api/categories/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || `Gagal mengambil data kategori dengan ID ${id}.`);
    }
}

export async function updateCategory(id, categoryData) {
    try {
        const response = await axios.put(`/api/categories/${id}`, categoryData);
        return response.data;
    } catch (error) {
        throw error.response?.data || new Error(`Gagal memperbarui kategori dengan ID ${id}.`);
    }
}

export async function deleteCategory(id) {
    try {
        const response = await axios.delete(`/api/categories/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || `Gagal menghapus kategori dengan ID ${id}.`);
    }
}
