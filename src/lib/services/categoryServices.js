import axios from "axios";

export async function getAllCategories() {
    try {
        const response = await axios.get('/api/categories');
        return response.data;
    } catch (error) {
        console.error("Error fetching categories:", error);
        throw error;
    }
}