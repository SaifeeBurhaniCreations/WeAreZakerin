import { useAuthHeader } from "../hooks/useAuthHeader";
import api from "../lib/axios";

// CREATE Occasion
export const createOccasion = async (formData: any) => {
    const headers = await useAuthHeader();
    return api.post("/occassion/create", formData, { headers });
};

// UPDATE Occasion
export const updateOccasion = async (id: string, updatedData: any) => {
    const headers = await useAuthHeader();
    return api.put(`/occassion/update/${id}`, updatedData, { headers });
};

// DELETE Occasion
export const deleteOccasion = async (id: string) => {
    const headers = await useAuthHeader();
    return api.delete(`/occassion/remove/${id}`, { headers });
};

// FETCH all occasions
export const fetchAllOccasions = async () => {
    return api.get("/occassion/fetch/all");
};

export const fetchOccasionPending = async (status: string) => {
    return api.get(`/occassion/fetch/status/${status}`);
};

export const fetchOccasionById = async (id: string) => {
    return api.get(`/occassion/fetch/id/${id}`);
};

// FETCH occasions by specific date (YYYY-MM-DD)
export const fetchOccasionsByDate = async (date: string) => {
    return api.get(`/occassion/fetch/date/${date}`);
};

// FETCH occasions by month (MM or YYYY-MM)
export const fetchOccasionsByMonth = async (month: string) => {
    return api.get(`/occassion/fetch/month/${month}`);
};

// FETCH occasions by year (YYYY)
export const fetchOccasionsByYear = async (year: string) => {
    return api.get(`/occassion/fetch/year/${year}`);
};

// FETCH grouped parties (aggregation)
export const fetchOccasionGroups = async () => {
    return api.get("/occassion/fetch/group");
};
