import * as SecureStore from "expo-secure-store";

export const useAuthHeader = async () => {
    const token = await SecureStore.getItemAsync("metadata");
    return {
        Authorization: `Bearer ${token}`,
    };
};