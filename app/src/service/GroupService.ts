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

export const removeMemberFromGroup = async (groupId: string, userId: string) => {
    const token = await SecureStore.getItemAsync("metadata");
    return api.post(`/group/${groupId}/remove/member`, { userId }, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

export const transferAdminRole = async (groupId: string, newAdminId: string) => {
    const token = await SecureStore.getItemAsync("metadata");
    return api.post(`/group/${groupId}/transfer/role`, { newAdminId }, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

export const addMemberInGroup = async (formData: { memberId: string, groupId: string }) => {
    const token = await SecureStore.getItemAsync("metadata");
    const { memberId: userId, groupId } = formData;
    return api.put(`/group/${groupId}/add/member`, { userId }, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

export const leaveGroup = async (userId: string) => {
    return api.put(`/group/leave/${userId}`);
};

export { createGroup, fetchGroup, fetchGroupById };