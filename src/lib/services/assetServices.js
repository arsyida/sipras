import axios from 'axios';

export async function getTotalAsset() {
    const response = await axios.get('/api/assets');
    return response.data.pagination.totalAssets;
}

export async function getAllAsset() {
    const response = await axios.get('/api/assets');
    console.log("Data aset berhasil diambil:", response.data);
    return response.data;
}