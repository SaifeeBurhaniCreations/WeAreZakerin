import { useCallback, useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    fetchAllOccasions,
    fetchOccasionsByDate,
    fetchOccasionsByMonth,
    fetchOccasionsByYear,
    fetchOccasionGroups,
    fetchOccasionPending,
    createOccasion,
    fetchOccasionById,
    updateOccasion as updateOccasionService,
    deleteOccasion as removeOccasionService
} from "../service/OccassionService";
import { Occassion } from "../redux/slices/OccassionSlice";
import { socket } from "../lib/socket";
import { useSocketListeners } from "./useSocketListener";
import { QUERY_KEYS } from "../constants/queryKeys";

// 1️⃣ Fetch ALL occasions with socket integration
export const useOccasions = () => {
    const queryClient = useQueryClient();
    
    // Initialize socket listeners
    useSocketListeners(queryClient);

    const query = useQuery({
        queryKey: QUERY_KEYS.occasions,
        queryFn: async () => {
            const res = await fetchAllOccasions();
            return res.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false, // Rely more on socket updates
    });

    return {
        data: query.data || [],
        isLoading: query.isLoading,
        isError: query.isError,
        isSuccess: query.isSuccess,
        error: query.error,
        refetch: query.refetch,
    };
};

// 2️⃣ Create NEW occasion with socket integration
export const useCreateOccasion = () => {
    const queryClient = useQueryClient();
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const create = useCallback(
        async (data: any) => {
            setIsLoading(true);
            setIsError(false);
            setIsSuccess(false);
            setError(null);

            // Optimistic ID for immediate UI feedback
            const optimisticId = `temp-${Date.now()}`;
            const optimisticOccasion = {
                ...data,
                _id: optimisticId,
                isOptimistic: true,
                createdAt: new Date(),
            };

            try {
                // Immediate optimistic update
                queryClient.setQueryData(QUERY_KEYS.occasions, (old: Occassion[] = []) => [
                    optimisticOccasion,
                    ...old
                ]);

                const response = await createOccasion(data);

                if (response.status === 201) {
                    // Replace optimistic data with real data
                    queryClient.setQueryData(QUERY_KEYS.occasions, (old: Occassion[] = []) =>
                        old.map(item =>
                            item._id === optimisticId ? response.data : item
                        )
                    );

                    // Cache the individual occasion
                    queryClient.setQueryData(QUERY_KEYS.occasion(response.data._id), response.data);

                    setIsSuccess(true);
                    return { success: true, data: response.data };
                } else {
                    // Remove optimistic data on failure
                    queryClient.setQueryData(QUERY_KEYS.occasions, (old: Occassion[] = []) =>
                        old.filter(item => item._id !== optimisticId)
                    );

                    const errMsg = response.data?.error || "Something went wrong";
                    setIsError(true);
                    setError(errMsg);
                    return { success: false, error: errMsg };
                }
            } catch (err: any) {
                // Remove optimistic data on error
                queryClient.setQueryData(QUERY_KEYS.occasions, (old: Occassion[] = []) =>
                    old.filter(item => item._id !== optimisticId)
                );

                const errMsg = err?.message || "Request failed";
                setIsError(true);
                setError(errMsg);
                return { success: false, error: errMsg };
            } finally {
                setIsLoading(false);
            }
        },
        [queryClient]
    );

    return { create, isLoading, isError, isSuccess, error };
};

// 3️⃣ Fetch pending occasions with socket integration
export const usePendingOccasions = (status: string | string[] = ['pending', 'started', 'ended']) => {
    const queryClient = useQueryClient();
    const statuses = Array.isArray(status) ? status : [status];

    // Initialize socket listeners
    useSocketListeners(queryClient);

    const query = useQuery({
        queryKey: QUERY_KEYS.pendingOccasions(statuses),
        queryFn: async () => {
            const res = await fetchOccasionPending(statuses);
            return res.data || [];
        },
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
    });

    return {
        data: query.data || [],
        isLoading: query.isLoading,
        isError: query.isError,
        isSuccess: query.isSuccess,
        error: query.error,
        refetch: query.refetch,
    };
};

// 4️⃣ Delete occasion with enhanced optimistic updates
export const useDeleteOccasion = () => {
    const queryClient = useQueryClient();
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deleteOccasion = useCallback(
        async (occasionId: string) => {
            if (!occasionId) {
                setIsError(true);
                setError('Invalid occasion ID');
                return { success: false, error: 'Invalid occasion ID' };
            }

            setIsLoading(true);
            setIsError(false);
            setIsSuccess(false);
            setError(null);

            try {
                const response = await removeOccasionService(occasionId);

                if (response.status === 200) {
                    // Optimistically remove from cache
                    queryClient.setQueryData(QUERY_KEYS.occasions, (old: Occassion[] = []) =>
                        old.filter(occasion => occasion._id !== occasionId)
                    );

                    // Remove individual occasion from cache
                    queryClient.removeQueries({ queryKey: QUERY_KEYS.occasion(occasionId) });

                    // Invalidate related queries
                    await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.occasions });

                    setIsSuccess(true);
                    return { success: true };
                } else {
                    const errMsg = response.data?.error || 'Failed to delete occasion';
                    setIsError(true);
                    setError(errMsg);
                    return { success: false, error: errMsg };
                }
            } catch (err: any) {
                const errMsg = err?.message || 'Request failed';
                setIsError(true);
                setError(errMsg);
                return { success: false, error: errMsg };
            } finally {
                setIsLoading(false);
            }
        },
        [queryClient]
    );

    return { deleteOccasion, isLoading, isError, isSuccess, error };
};

// 5️⃣ Update occasion with enhanced optimistic updates
export const useUpdateOccassion = () => {
    const queryClient = useQueryClient();
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateOccassion = useCallback(
        async (occasionId: string, data: any) => {
            if (!occasionId || occasionId.startsWith('temp-')) {
                setIsError(true);
                setError('Invalid occasion ID');
                return { success: false, error: 'Invalid occasion ID' };
            }

            setIsLoading(true);
            setIsError(false);
            setIsSuccess(false);
            setError(null);

            // Store original data for rollback
            const originalOccasions = queryClient.getQueryData(QUERY_KEYS.occasions) as Occassion[];
            const originalOccasion = queryClient.getQueryData(QUERY_KEYS.occasion(occasionId));

            try {
                // Optimistic update
                const optimisticData = { ...data, _id: occasionId, isUpdating: true };
                
                queryClient.setQueryData(QUERY_KEYS.occasions, (old: Occassion[] = []) =>
                    old.map(occasion =>
                        occasion._id === occasionId ? { ...occasion, ...optimisticData } : occasion
                    )
                );

                queryClient.setQueryData(QUERY_KEYS.occasion(occasionId), optimisticData);

                const response = await updateOccasionService(occasionId, data);

                if (response.status === 200) {
                    // Confirm update with server data
                    queryClient.setQueryData(QUERY_KEYS.occasions, (old: Occassion[] = []) =>
                        old.map(occasion =>
                            occasion._id === occasionId ? response.data : occasion
                        )
                    );

                    queryClient.setQueryData(QUERY_KEYS.occasion(occasionId), response.data);

                    setIsSuccess(true);
                    return { success: true, data: response.data };
                } else {
                    // Rollback on failure
                    queryClient.setQueryData(QUERY_KEYS.occasions, originalOccasions);
                    if (originalOccasion) {
                        queryClient.setQueryData(QUERY_KEYS.occasion(occasionId), originalOccasion);
                    }

                    const errMsg = response.data?.error || 'Failed to update occasion';
                    setIsError(true);
                    setError(errMsg);
                    return { success: false, error: errMsg };
                }
            } catch (err: any) {
                // Rollback on error
                queryClient.setQueryData(QUERY_KEYS.occasions, originalOccasions);
                if (originalOccasion) {
                    queryClient.setQueryData(QUERY_KEYS.occasion(occasionId), originalOccasion);
                }

                const errMsg = err?.message || 'Request failed';
                setIsError(true);
                setError(errMsg);
                return { success: false, error: errMsg };
            } finally {
                setIsLoading(false);
            }
        },
        [queryClient]
    );

    return { updateOccassion, isLoading, isError, isSuccess, error };
};

// 6️⃣ Fetch SINGLE occasion by ID with socket integration
export const useOccasionById = (id: string) => {
    const queryClient = useQueryClient();
    
    // Initialize socket listeners
    useSocketListeners(queryClient);

    const query = useQuery({
        queryKey: QUERY_KEYS.occasion(id),
        queryFn: async () => {
            const res = await fetchOccasionById(id);
            return res.data;
        },
        enabled: !!id && !id.startsWith('temp-'), // Don't fetch optimistic IDs
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    return {
        data: query.data,
        isLoading: query.isLoading,
        isError: query.isError,
        isSuccess: query.isSuccess,
        error: query.error,
        refetch: query.refetch,
    };
};

// 7️⃣ Occasions by Date with socket integration
export const useOccasionsByDate = (date: string) => {
    const queryClient = useQueryClient();
    
    useSocketListeners(queryClient);

    const query = useQuery({
        queryKey: QUERY_KEYS.occasionsByDate(date),
        queryFn: async () => {
            const res = await fetchOccasionsByDate(date);
            return res.data.occasions || [];
        },
        enabled: !!date,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    return {
        data: query.data || [],
        isLoading: query.isLoading,
        isError: query.isError,
        isSuccess: query.isSuccess,
        error: query.error,
        refetch: query.refetch,
    };
};

// 8️⃣ Occasions by Month with socket integration
export const useOccasionsByMonth = (month: string) => {
    const queryClient = useQueryClient();
    
    useSocketListeners(queryClient);

    const query = useQuery({
        queryKey: QUERY_KEYS.occasionsByMonth(month),
        queryFn: async () => {
            const res = await fetchOccasionsByMonth(month);
            return res.data.occasions || [];
        },
        enabled: !!month,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    return {
        data: query.data || [],
        isLoading: query.isLoading,
        isError: query.isError,
        isSuccess: query.isSuccess,
        error: query.error,
        refetch: query.refetch,
    };
};

// 9️⃣ Occasions by Year with socket integration
export const useOccasionsByYear = (year: string) => {
    const queryClient = useQueryClient();
    
    useSocketListeners(queryClient);

    const query = useQuery({
        queryKey: QUERY_KEYS.occasionsByYear(year),
        queryFn: async () => {
            const res = await fetchOccasionsByYear(year);
            return res.data || [];
        },
        enabled: !!year,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    return {
        data: query.data || [],
        isLoading: query.isLoading,
        isError: query.isError,
        isSuccess: query.isSuccess,
        error: query.error,
        refetch: query.refetch,
    };
};

// 🔟 Grouped Occasions with socket integration
export const useOccasionGroups = () => {
    const queryClient = useQueryClient();
    
    useSocketListeners(queryClient);

    const query = useQuery({
        queryKey: QUERY_KEYS.occasionGroups,
        queryFn: async () => {
            const res = await fetchOccasionGroups();
            return res.data || [];
        },
        staleTime: 10 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    return {
        data: query.data || [],
        isLoading: query.isLoading,
        isError: query.isError,
        isSuccess: query.isSuccess,
        error: query.error,
        refetch: query.refetch,
    };
};

// Utility hook to prefetch occasions
export const usePrefetchOccasions = () => {
    const queryClient = useQueryClient();

    const prefetchOccasions = useCallback(() => {
        return queryClient.prefetchQuery({
            queryKey: QUERY_KEYS.occasions,
            queryFn: async () => {
                const res = await fetchAllOccasions();
                return res.data;
            },
            staleTime: 5 * 60 * 1000,
        });
    }, [queryClient]);

    const prefetchOccasionById = useCallback((id: string) => {
        if (id.startsWith('temp-')) return Promise.resolve(); // Skip optimistic IDs
        
        return queryClient.prefetchQuery({
            queryKey: QUERY_KEYS.occasion(id),
            queryFn: async () => {
                const res = await fetchOccasionById(id);
                return res.data;
            },
            staleTime: 5 * 60 * 1000,
        });
    }, [queryClient]);

    return { prefetchOccasions, prefetchOccasionById };
};

// Connection status hook for UI feedback
export const useSocketConnectionStatus = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [isReconnecting, setIsReconnecting] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined' && socket) {

            const handleConnect = () => {
                setIsConnected(true);
                setIsReconnecting(false);
            };

            const handleDisconnect = () => {
                setIsConnected(false);
            };

            const handleReconnecting = () => {
                setIsReconnecting(true);
            };

            socket.on('connect', handleConnect);
            socket.on('disconnect', handleDisconnect);
            socket.on('reconnecting', handleReconnecting);

            // Initial status
            setIsConnected(socket.connected);

            return () => {
                socket.off('connect', handleConnect);
                socket.off('disconnect', handleDisconnect);
                socket.off('reconnecting', handleReconnecting);
            };
        }
    }, []);

    return { isConnected, isReconnecting };
};