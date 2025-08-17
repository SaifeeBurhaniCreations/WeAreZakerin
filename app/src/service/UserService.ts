import api from "../lib/axios";
import * as SecureStore from 'expo-secure-store';

const createUser = async (formData: any) => {
    const token = await SecureStore.getItemAsync("metadata");
    return api.post("/users/create", formData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

const fetchUser = async (token: string) => {
    return api.get("/users", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

const fetchMe = async (token: string) => {
    return api.get("/users/me", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

const fetchUserById = async (id: string) => {
    const token = await SecureStore.getItemAsync("metadata");
    return api.get(`/users/fetch/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

const removeUser = async (data: { id: string, admin: string | null }) => {
    const { id, admin } = data;
    const token = await SecureStore.getItemAsync("metadata");
    
    return api.delete(`/users/remove/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        data: { admin },
    });
};


export { createUser, fetchUser, fetchUserById, fetchMe, removeUser};