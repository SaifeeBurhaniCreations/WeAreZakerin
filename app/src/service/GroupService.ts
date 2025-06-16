import api from "../lib/axios";
import * as SecureStore from 'expo-secure-store';

const createGroup = async(formData: any) => {
    const token = await SecureStore.getItemAsync("metadata");
    return api.post("/group/create", formData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

const fetchGroup = async(token: string) => {
    return api.get("/group", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

const fetchGroupById = async(id: string) => {
    const token = await SecureStore.getItemAsync("metadata");
    return api.get(`/group/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

export { createGroup, fetchGroup, fetchGroupById };