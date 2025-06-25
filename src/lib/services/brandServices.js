import axios from "axios";

export async function getAllBrands() {
    try {
        const response = await axios.get('/api/brands');
        return response.data;
    } catch (error) {
        console.error("Error fetching brands:", error);
        throw error;
    }
    
}