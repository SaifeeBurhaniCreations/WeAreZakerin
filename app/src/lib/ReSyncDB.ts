import {
    useQuery,
    useMutation,
    useQueryClient,
    QueryClient,
    UseQueryOptions,
    UseMutationOptions,
    QueryKey,
} from "@tanstack/react-query";
import { useRef, useEffect, useMemo, useCallback } from "react";
import { socket } from "./socket";

// ------------------ ✅ ENHANCED TYPES ------------------ //
interface BaseEntity {
    _id: string;
    createdAt?: string;
    updatedAt?: string;
    isOptimistic?: boolean;
}

interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
    meta?: {
        total?: number;
        page?: number;
        limit?: number;
    };
}

interface PaginationParams {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
}

interface FilterParams {
    [key: string]: string | string[] | number | boolean | Date;
}

type CrudServices<T> = {
    fetchAll: (params?: PaginationParams & FilterParams) => Promise<ApiResponse<T[]>>;
    fetchOne?: (id: string) => Promise<ApiResponse<T>>;
    create?: (payload: Partial<T>) => Promise<ApiResponse<T>>;
    update?: (id: string, payload: Partial<T>) => Promise<ApiResponse<T>>;
    delete?: (id: string) => Promise<ApiResponse<{ success: boolean }>>;
    bulkCreate?: (payloads: Partial<T>[]) => Promise<ApiResponse<T[]>>;
    bulkUpdate?: (updates: { id: string; payload: Partial<T> }[]) => Promise<ApiResponse<T[]>>;
    bulkDelete?: (ids: string[]) => Promise<ApiResponse<{ deletedCount: number }>>;
};

interface SocketEvent<T> {
    event: string;
    handler: (data: T, queryClient: QueryClient, metadata?: any) => void;
}

interface DerivedQuery<T> {
    name: string;
    filter: (data: T[], ...args: any[]) => T[];
    cacheable?: boolean;
    dependencies?: string[];
}

interface CacheStrategy {
    staleTime?: number;
    gcTime?: number;
    refetchOnWindowFocus?: boolean;
    refetchOnReconnect?: boolean;
    refetchInterval?: number;
    retry?: number | ((failureCount: number, error: Error) => boolean);
}

interface OptimisticUpdateConfig {
    enabled?: boolean;
    timeout?: number;
    fallbackOnError?: boolean;
}

interface ErrorHandlingConfig {
    showNotifications?: boolean;
    logErrors?: boolean;
    customErrorHandler?: (error: Error, operation: string) => void;
    retryConfig?: {
        maxRetries?: number;
        retryDelay?: (attemptIndex: number) => number;
    };
}

interface PerformanceConfig {
    enableVirtualization?: boolean;
    debounceFilters?: number;
    memoizeFilters?: boolean;
    enablePrefetch?: boolean;
}

interface MiddlewareConfig<T extends BaseEntity> {
    rootKey: string;
    services: CrudServices<T>;
    socketEvents?: SocketEvent<any>[];
    derivedQueries?: DerivedQuery<T>[];
    cacheStrategy?: CacheStrategy;
    optimisticUpdates?: OptimisticUpdateConfig;
    errorHandling?: ErrorHandlingConfig;
    performance?: PerformanceConfig;
    validation?: {
        validateCreate?: (data: Partial<T>) => string | null;
        validateUpdate?: (data: Partial<T>) => string | null;
    };
}

// ------------------ ✅ ERROR HANDLING UTILITIES ------------------ //
class ResourceError extends Error {
    constructor(
        message: string,
        public operation: string,
        public statusCode?: number,
        public originalError?: Error
    ) {
        super(message);
        this.name = 'ResourceError';
    }
}

const handleApiError = (error: any, operation: string): ResourceError => {
    if (error instanceof ResourceError) return error;

    const message = error?.response?.data?.message || error?.message || 'Unknown error occurred';
    const statusCode = error?.response?.status || error?.status;

    return new ResourceError(message, operation, statusCode, error);
};

const defaultRetryFn = (failureCount: number, error: any): boolean => {
    if (failureCount >= 3) return false;
    const status = error?.response?.status || error?.status;
    return !status || (status >= 500 && status < 600) || status === 408 || status === 429;
};

// ------------------ ✅ PERFORMANCE UTILITIES ------------------ //
const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

const memoizeFilter = <T>(filterFn: (data: T[], ...args: any[]) => T[]) => {
    const cache = new Map<string, T[]>();

    return (data: T[], ...args: any[]): T[] => {
        const key = JSON.stringify({ dataLength: data.length, args });

        if (cache.has(key)) {
            return cache.get(key)!;
        }

        const result = filterFn(data, ...args);
        cache.set(key, result);

        // Cleanup old cache entries (keep last 50)
        if (cache.size > 50) {
            const firstKey = cache.keys().next().value;
            cache.delete(firstKey);
        }

        return result;
    };
};

// ------------------ ✅ ENHANCED FACTORY HOOK ------------------ //
export function createResourceHooks<T extends BaseEntity>(config: MiddlewareConfig<T>) {
    const {
        rootKey,
        services,
        socketEvents = [],
        derivedQueries = [],
        cacheStrategy = {},
        optimisticUpdates = { enabled: true, timeout: 5000, fallbackOnError: true },
        errorHandling = { showNotifications: false, logErrors: true },
        performance = { debounceFilters: 300, memoizeFilters: true },
        validation = {},
    } = config;

    const {
        staleTime = 5 * 60 * 1000,
        gcTime = 10 * 60 * 1000,
        refetchOnWindowFocus = false,
        refetchOnReconnect = true,
        retry = defaultRetryFn,
    } = cacheStrategy;

    // ------------------ ✅ ENHANCED SOCKET LISTENERS ------------------ //
    const useSocketListeners = (queryClient: QueryClient) => {
        const lastUpdate = useRef<{ [key: string]: number }>({});
        const reconnectCount = useRef(0);

        const isValidUpdate = useCallback((key: string, timestamp?: string | Date) => {
            if (!timestamp) return true;

            const ts = new Date(timestamp).getTime();
            const lastTs = lastUpdate.current[key] || 0;

            if (ts > lastTs) {
                lastUpdate.current[key] = ts;
                return true;
            }
            return false;
        }, []);

        useEffect(() => {
            if (!socket) {
                console.warn(`[${rootKey}] Socket not available`);
                return;
            }

            const handleReconnect = () => {
                reconnectCount.current++;
                if (reconnectCount.current > 1) {
                    // Invalidate queries on reconnect to ensure fresh data
                    queryClient.invalidateQueries({ queryKey: [rootKey] });
                }
            };

            const handlers = socketEvents.map(({ event, handler }) => {
                const wrappedHandler = (data: any) => {
                    try {
                        const eventKey = `${event}_${data?.id || data?._id || 'bulk'}`;
                        if (!isValidUpdate(eventKey, data?.timestamp)) {
                            return;
                        }

                        handler(data, queryClient, { event, timestamp: new Date() });
                    } catch (error) {
                        console.error(`[${rootKey}] Socket event handler error:`, error);
                        if (errorHandling.customErrorHandler) {
                            errorHandling.customErrorHandler(
                                error as Error,
                                `socket_${event}`
                            );
                        }
                    }
                };

                socket.on(event, wrappedHandler);
                return { event, handler: wrappedHandler };
            });

            socket.on('connect', handleReconnect);

            return () => {
                handlers.forEach(({ event, handler }) => {
                    socket.off(event, handler);
                });
                socket.off('connect', handleReconnect);
            };
        }, [queryClient, isValidUpdate]);
    };

    // ------------------ ✅ ENHANCED ROOT HOOK ------------------ //
    const useAll = (
        params?: PaginationParams & FilterParams,
        options?: Partial<UseQueryOptions<ApiResponse<T[]>, ResourceError, T[]>>
    ) => {
        const queryClient = useQueryClient();
        useSocketListeners(queryClient);

        const queryKey = useMemo(() =>
            params ? [rootKey, 'paginated', params] : [rootKey]
            , [params]);

        return useQuery<ApiResponse<T[]>, ResourceError, T[]>({
            queryKey,
            queryFn: () => services.fetchAll(params),
            select: (response) => response.data,
            staleTime,
            gcTime,
            refetchOnWindowFocus,
            refetchOnReconnect,
            retry,
            throwOnError: false,
            onError: (error: ResourceError) => {
                if (errorHandling.logErrors) {
                    console.error(`[${rootKey}] Fetch all error:`, error);
                }
                if (errorHandling.customErrorHandler) {
                    errorHandling.customErrorHandler(error, 'fetchAll');
                }
            },
            ...options,
        });
    };

    // ------------------ ✅ ENHANCED INDIVIDUAL FETCH ------------------ //
    const useOne = (
        id: string,
        options?: Partial<UseQueryOptions<ApiResponse<T>, ResourceError, T>>
    ) => {
        const queryClient = useQueryClient();

        return useQuery<ApiResponse<T>, ResourceError, T>({
            queryKey: [rootKey, id],
            queryFn: () => {
                if (!services.fetchOne) {
                    throw new ResourceError('fetchOne service not implemented', 'fetchOne');
                }
                return services.fetchOne(id);
            },
            select: (response) => response.data,
            enabled: !!id && !!services.fetchOne,
            initialData: () => {
                const allData = queryClient.getQueryData<T[]>([rootKey]);
                if (allData) {
                    const item = allData.find((item) => item._id === id);
                    return item ? { data: item, success: true } as ApiResponse<T> : undefined;
                }
                return undefined;
            },
            staleTime,
            gcTime,
            retry,
            onError: (error: ResourceError) => {
                if (errorHandling.logErrors) {
                    console.error(`[${rootKey}] Fetch one error:`, error);
                }
                if (errorHandling.customErrorHandler) {
                    errorHandling.customErrorHandler(error, 'fetchOne');
                }
            },
            ...options,
        });
    };

    // ------------------ ✅ ENHANCED CREATE ------------------ //
    const useCreate = (options?: Partial<UseMutationOptions<ApiResponse<T>, ResourceError, Partial<T>>>) => {
        const queryClient = useQueryClient();

        return useMutation<ApiResponse<T>, ResourceError, Partial<T>>({
            mutationFn: async (newItem) => {
                if (!services.create) {
                    throw new ResourceError('Create service not implemented', 'create');
                }

                // Validation
                if (validation.validateCreate) {
                    const validationError = validation.validateCreate(newItem);
                    if (validationError) {
                        throw new ResourceError(validationError, 'create_validation');
                    }
                }

                try {
                    return await services.create(newItem);
                } catch (error) {
                    throw handleApiError(error, 'create');
                }
            },
            onMutate: async (newItem) => {
                if (!optimisticUpdates.enabled) return;

                const optimisticId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                const optimisticObj = {
                    ...newItem,
                    _id: optimisticId,
                    isOptimistic: true,
                    createdAt: new Date().toISOString(),
                } as T;

                // Cancel ongoing queries
                await queryClient.cancelQueries({ queryKey: [rootKey] });

                // Get previous data
                const previousData = queryClient.getQueryData<T[]>([rootKey]) || [];

                // Optimistically update
                queryClient.setQueryData<T[]>([rootKey], [optimisticObj, ...previousData]);

                // Set timeout for optimistic update cleanup
                const timeoutId = setTimeout(() => {
                    if (optimisticUpdates.fallbackOnError) {
                        queryClient.setQueryData<T[]>([rootKey], previousData);
                    }
                }, optimisticUpdates.timeout);

                return { previousData, optimisticId, timeoutId };
            },
            onSuccess: (response, variables, context) => {
                if (context?.timeoutId) {
                    clearTimeout(context.timeoutId);
                }

                const newItem = response.data;

                // Update main query
                queryClient.setQueryData<T[]>([rootKey], (old = []) =>
                    old.map((item) =>
                        item._id === context?.optimisticId ? newItem : item
                    )
                );

                // Set individual item cache
                queryClient.setQueryData([rootKey, newItem._id], newItem);

                // Invalidate related queries
                queryClient.invalidateQueries({
                    queryKey: [rootKey],
                    exact: false
                });

                if (errorHandling.logErrors) {
                    console.log(`[${rootKey}] Item created successfully:`, newItem._id);
                }
            },
            onError: (error: ResourceError, variables, context) => {
                if (context?.timeoutId) {
                    clearTimeout(context.timeoutId);
                }

                // Rollback optimistic update
                if (context?.previousData) {
                    queryClient.setQueryData([rootKey], context.previousData);
                }

                if (errorHandling.logErrors) {
                    console.error(`[${rootKey}] Create error:`, error);
                }
                if (errorHandling.customErrorHandler) {
                    errorHandling.customErrorHandler(error, 'create');
                }
            },
            retry: errorHandling.retryConfig?.maxRetries || 1,
            retryDelay: errorHandling.retryConfig?.retryDelay || ((attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)),
            ...options,
        });
    };

    // ------------------ ✅ ENHANCED UPDATE ------------------ //
    const useUpdate = (options?: Partial<UseMutationOptions<ApiResponse<T>, ResourceError, { id: string; payload: Partial<T> }>>) => {
        const queryClient = useQueryClient();

        return useMutation<ApiResponse<T>, ResourceError, { id: string; payload: Partial<T> }>({
            mutationFn: async ({ id, payload }) => {
                if (!services.update) {
                    throw new ResourceError('Update service not implemented', 'update');
                }

                // Validation
                if (validation.validateUpdate) {
                    const validationError = validation.validateUpdate(payload);
                    if (validationError) {
                        throw new ResourceError(validationError, 'update_validation');
                    }
                }

                try {
                    return await services.update(id, payload);
                } catch (error) {
                    throw handleApiError(error, 'update');
                }
            },
            onMutate: async ({ id, payload }) => {
                if (!optimisticUpdates.enabled) return;

                await queryClient.cancelQueries({ queryKey: [rootKey] });
                await queryClient.cancelQueries({ queryKey: [rootKey, id] });

                const previousAllData = queryClient.getQueryData<T[]>([rootKey]) || [];
                const previousItemData = queryClient.getQueryData<T>([rootKey, id]);

                // Optimistic update for all items
                queryClient.setQueryData<T[]>([rootKey], (old = []) =>
                    old.map((item) =>
                        item._id === id
                            ? { ...item, ...payload, updatedAt: new Date().toISOString() }
                            : item
                    )
                );

                // Optimistic update for individual item
                if (previousItemData) {
                    queryClient.setQueryData([rootKey, id], {
                        ...previousItemData,
                        ...payload,
                        updatedAt: new Date().toISOString(),
                    });
                }

                return { previousAllData, previousItemData, id };
            },
            onSuccess: (response, { id }, context) => {
                const updatedItem = response.data;

                // Update both caches with server response
                queryClient.setQueryData<T[]>([rootKey], (old = []) =>
                    old.map((item) => item._id === id ? updatedItem : item)
                );

                queryClient.setQueryData([rootKey, id], updatedItem);

                if (errorHandling.logErrors) {
                    console.log(`[${rootKey}] Item updated successfully:`, id);
                }
            },
            onError: (error: ResourceError, { id }, context) => {
                // Rollback optimistic updates
                if (context?.previousAllData) {
                    queryClient.setQueryData([rootKey], context.previousAllData);
                }
                if (context?.previousItemData) {
                    queryClient.setQueryData([rootKey, id], context.previousItemData);
                }

                if (errorHandling.logErrors) {
                    console.error(`[${rootKey}] Update error:`, error);
                }
                if (errorHandling.customErrorHandler) {
                    errorHandling.customErrorHandler(error, 'update');
                }
            },
            retry: errorHandling.retryConfig?.maxRetries || 1,
            retryDelay: errorHandling.retryConfig?.retryDelay || ((attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)),
            ...options,
        });
    };

    // ------------------ ✅ ENHANCED DELETE ------------------ //
    const useDelete = (options?: Partial<UseMutationOptions<ApiResponse<{ success: boolean }>, ResourceError, string>>) => {
        const queryClient = useQueryClient();

        return useMutation<ApiResponse<{ success: boolean }>, ResourceError, string>({
            mutationFn: async (id: string) => {
                if (!services.delete) {
                    throw new ResourceError('Delete service not implemented', 'delete');
                }

                try {
                    return await services.delete(id);
                } catch (error) {
                    throw handleApiError(error, 'delete');
                }
            },
            onMutate: async (id) => {
                if (!optimisticUpdates.enabled) return;

                await queryClient.cancelQueries({ queryKey: [rootKey] });
                await queryClient.cancelQueries({ queryKey: [rootKey, id] });

                const previousAllData = queryClient.getQueryData<T[]>([rootKey]) || [];
                const previousItemData = queryClient.getQueryData<T>([rootKey, id]);

                // Optimistically remove item
                queryClient.setQueryData<T[]>([rootKey], (old = []) =>
                    old.filter((item) => item._id !== id)
                );

                return { previousAllData, previousItemData, id };
            },
            onSuccess: (_, id, context) => {
                // Ensure item is removed and invalidate related queries
                queryClient.removeQueries({ queryKey: [rootKey, id] });
                queryClient.invalidateQueries({
                    queryKey: [rootKey],
                    exact: false
                });

                if (errorHandling.logErrors) {
                    console.log(`[${rootKey}] Item deleted successfully:`, id);
                }
            },
            onError: (error: ResourceError, id, context) => {
                // Rollback optimistic updates
                if (context?.previousAllData) {
                    queryClient.setQueryData([rootKey], context.previousAllData);
                }
                if (context?.previousItemData) {
                    queryClient.setQueryData([rootKey, id], context.previousItemData);
                }

                if (errorHandling.logErrors) {
                    console.error(`[${rootKey}] Delete error:`, error);
                }
                if (errorHandling.customErrorHandler) {
                    errorHandling.customErrorHandler(error, 'delete');
                }
            },
            retry: errorHandling.retryConfig?.maxRetries || 1,
            retryDelay: errorHandling.retryConfig?.retryDelay || ((attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)),
            ...options,
        });
    };

    // ------------------ ✅ BULK OPERATIONS ------------------ //
    const useBulkCreate = () => {
        const queryClient = useQueryClient();

        return useMutation<ApiResponse<T[]>, ResourceError, Partial<T>[]>({
            mutationFn: async (payloads) => {
                if (!services.bulkCreate) {
                    throw new ResourceError('Bulk create service not implemented', 'bulkCreate');
                }

                // Validate all items
                if (validation.validateCreate) {
                    for (const payload of payloads) {
                        const error = validation.validateCreate(payload);
                        if (error) throw new ResourceError(error, 'bulkCreate_validation');
                    }
                }

                try {
                    return await services.bulkCreate(payloads);
                } catch (error) {
                    throw handleApiError(error, 'bulkCreate');
                }
            },
            onSuccess: (response) => {
                const newItems = response.data;
                queryClient.setQueryData<T[]>([rootKey], (old = []) => [...newItems, ...old]);

                // Cache individual items
                newItems.forEach(item => {
                    queryClient.setQueryData([rootKey, item._id], item);
                });
            },
        });
    };

    const useBulkUpdate = () => {
        const queryClient = useQueryClient();

        return useMutation<ApiResponse<T[]>, ResourceError, { id: string; payload: Partial<T> }[]>({
            mutationFn: async (updates) => {
                if (!services.bulkUpdate) {
                    throw new ResourceError('Bulk update service not implemented', 'bulkUpdate');
                }

                try {
                    return await services.bulkUpdate(updates);
                } catch (error) {
                    throw handleApiError(error, 'bulkUpdate');
                }
            },
            onSuccess: (response) => {
                const updatedItems = response.data;
                const updateMap = new Map(updatedItems.map(item => [item._id, item]));

                queryClient.setQueryData<T[]>([rootKey], (old = []) =>
                    old.map((item) => updateMap.get(item._id) || item)
                );

                // Update individual caches
                updatedItems.forEach(item => {
                    queryClient.setQueryData([rootKey, item._id], item);
                });
            },
        });
    };

    const useBulkDelete = () => {
        const queryClient = useQueryClient();

        return useMutation<ApiResponse<{ deletedCount: number }>, ResourceError, string[]>({
            mutationFn: async (ids) => {
                if (!services.bulkDelete) {
                    throw new ResourceError('Bulk delete service not implemented', 'bulkDelete');
                }

                try {
                    return await services.bulkDelete(ids);
                } catch (error) {
                    throw handleApiError(error, 'bulkDelete');
                }
            },
            onSuccess: (_, ids) => {
                const idsSet = new Set(ids);
                queryClient.setQueryData<T[]>([rootKey], (old = []) =>
                    old.filter((item) => !idsSet.has(item._id))
                );

                // Remove individual caches
                ids.forEach(id => {
                    queryClient.removeQueries({ queryKey: [rootKey, id] });
                });
            },
        });
    };

    // ------------------ ✅ ENHANCED FILTERING ------------------ //
    const useFilter = (
        filters?: FilterParams,
        fields?: (keyof T)[],
        options: {
            fromCacheOnly?: boolean;
            enableDebounce?: boolean;
            customFilter?: (item: T, filters: FilterParams) => boolean;
        } = {}
    ) => {
        const queryClient = useQueryClient();
        const { data: allData } = useAll();
        const { fromCacheOnly = false, enableDebounce = true, customFilter } = options;

        const dataset: T[] = fromCacheOnly
            ? queryClient.getQueryData<T[]>([rootKey]) || []
            : allData || [];

        const filterFunction = useMemo(() => {
            const baseFilter = (data: T[]) => {
                if (!filters || Object.keys(filters).length === 0) return data;

                return data.filter((item) => {
                    // Custom filter takes precedence
                    if (customFilter) {
                        return customFilter(item, filters);
                    }

                    // Default filtering logic
                    return Object.entries(filters).every(([key, value]) => {
                        const itemValue = (item as any)[key];

                        if (value === null || value === undefined) return true;

                        if (Array.isArray(value)) {
                            return value.includes(itemValue);
                        }

                        if (typeof value === 'string' && typeof itemValue === 'string') {
                            return itemValue.toLowerCase().includes(value.toLowerCase());
                        }

                        if (value instanceof Date && itemValue) {
                            return new Date(itemValue).getTime() === value.getTime();
                        }

                        return itemValue === value;
                    });
                });
            };

            return performance.memoizeFilters ? memoizeFilter(baseFilter) : baseFilter;
        }, [filters, customFilter]);

        const debouncedFilter = useMemo(() => {
            return enableDebounce && performance.debounceFilters
                ? debounce(filterFunction, performance.debounceFilters)
                : filterFunction;
        }, [filterFunction, enableDebounce]);

        const filteredData = useMemo(() => {
            const filtered = filterFunction(dataset);

            // Apply field selection if specified
            if (fields && fields.length > 0) {
                return filtered.map((item) =>
                    fields.reduce((acc, key) => {
                        acc[key] = item[key];
                        return acc;
                    }, {} as Partial<T>)
                );
            }

            return filtered;
        }, [dataset, filterFunction, fields]);

        return filteredData;
    };

    // ------------------ ✅ ENHANCED DERIVED QUERIES ------------------ //
    const derivedHooks = useMemo(() => {
        return derivedQueries.reduce((acc, dq) => {
            acc[dq.name] = (...args: any[]) => {
                const { data } = useAll();
                const filterFn = performance.memoizeFilters ? memoizeFilter(dq.filter) : dq.filter;
                return filterFn(data || [], ...args);
            };
            return acc;
        }, {} as Record<string, Function>);
    }, [derivedQueries]);

    // ------------------ ✅ UTILITY HOOKS ------------------ //
    const useInvalidate = () => {
        const queryClient = useQueryClient();

        return useCallback((type?: 'all' | 'list' | 'item', id?: string) => {
            switch (type) {
                case 'all':
                    return queryClient.invalidateQueries({ queryKey: [rootKey] });
                case 'list':
                    return queryClient.invalidateQueries({ queryKey: [rootKey], exact: true });
                case 'item':
                    return id
                        ? queryClient.invalidateQueries({ queryKey: [rootKey, id] })
                        : Promise.resolve();
                default:
                    return queryClient.invalidateQueries({ queryKey: [rootKey] });
            }
        }, [queryClient]);
    };

    const usePrefetch = () => {
        const queryClient = useQueryClient();

        return useCallback((id?: string, params?: PaginationParams & FilterParams) => {
            if (id && services.fetchOne) {
                queryClient.prefetchQuery({
                    queryKey: [rootKey, id],
                    queryFn: () => services.fetchOne!(id),
                    staleTime,
                });
            } else if (params) {
                queryClient.prefetchQuery({
                    queryKey: [rootKey, 'paginated', params],
                    queryFn: () => services.fetchAll(params),
                    staleTime,
                });
            }
        }, [queryClient]);
    };

    const useReset = () => {
        const queryClient = useQueryClient();

        return useCallback(() => {
            queryClient.removeQueries({ queryKey: [rootKey] });
            if (errorHandling.logErrors) {
                console.log(`[${rootKey}] Cache reset`);
            }
        }, [queryClient]);
    };

    const useStats = () => {
        const { data, isLoading, error } = useAll();

        return useMemo(() => ({
            total: data?.length || 0,
            isLoading,
            hasError: !!error,
            error: error as ResourceError | null,
            isEmpty: !isLoading && (!data || data.length === 0),
            lastUpdated: data?.length ? new Date().toISOString() : null,
        }), [data, isLoading, error]);
    };

    // ------------------ ✅ SEARCH AND PAGINATION ------------------ //
    const useSearch = (query: string, searchFields: (keyof T)[] = []) => {
        const { data } = useAll();

        return useMemo(() => {
            if (!query.trim() || !data) return data || [];

            const lowerQuery = query.toLowerCase();

            return data.filter((item) => {
                if (searchFields.length === 0) {
                    // Search all string fields
                    return Object.values(item).some((value) =>
                        typeof value === 'string' && value.toLowerCase().includes(lowerQuery)
                    );
                }

                // Search specific fields
                return searchFields.some((field) => {
                    const value = item[field];
                    return typeof value === 'string' && value.toLowerCase().includes(lowerQuery);
                });
            });
        }, [data, query, searchFields]);
    };

    const usePagination = (pageSize: number = 10) => {
        const [currentPage, setCurrentPage] = React.useState(1);
        const { data } = useAll();

        const paginatedData = useMemo(() => {
            if (!data) return { items: [], totalPages: 0, totalItems: 0 };

            const startIndex = (currentPage - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            const items = data.slice(startIndex, endIndex);

            return {
                items,
                totalPages: Math.ceil(data.length / pageSize),
                totalItems: data.length,
                currentPage,
                hasNextPage: endIndex < data.length,
                hasPrevPage: currentPage > 1,
            };
        }, [data, currentPage, pageSize]);

        const goToPage = useCallback((page: number) => {
            setCurrentPage(Math.max(1, Math.min(page, paginatedData.totalPages)));
        }, [paginatedData.totalPages]);

        const nextPage = useCallback(() => {
            if (paginatedData.hasNextPage) {
                setCurrentPage(prev => prev + 1);
            }
        }, [paginatedData.hasNextPage]);

        const prevPage = useCallback(() => {
            if (paginatedData.hasPrevPage) {
                setCurrentPage(prev => prev - 1);
            }
        }, [paginatedData.hasPrevPage]);

        return {
            ...paginatedData,
            goToPage,
            nextPage,
            prevPage,
            setCurrentPage,
        };
    };

    // ------------------ ✅ SORTING AND GROUPING ------------------ //
    const useSort = (sortField?: keyof T, sortOrder: 'asc' | 'desc' = 'asc') => {
        const { data } = useAll();

        return useMemo(() => {
            if (!data || !sortField) return data;

            return [...data].sort((a, b) => {
                const aVal = a[sortField];
                const bVal = b[sortField];

                if (aVal === bVal) return 0;

                const comparison = aVal < bVal ? -1 : 1;
                return sortOrder === 'asc' ? comparison : -comparison;
            });
        }, [data, sortField, sortOrder]);
        
    };

    const useGroupBy = (groupField: keyof T) => {
        const { data } = useAll();

        return useMemo(() => {
            if (!data) return {};

            return data.reduce((groups, item) => {
                const key = String(item[groupField]);
                if (!groups[key]) groups[key] = [];
                groups[key].push(item);
                return groups;
            }, {} as Record<string, T[]>);
        }, [data, groupField]);
    };

    // ------------------ ✅ REAL-TIME FEATURES ------------------ //
    const useSubscribe = (itemId?: string) => {
        const queryClient = useQueryClient();

        useEffect(() => {
            if (!socket || !itemId) return;

            const subscribeEvent = `${rootKey}:subscribe`;
            const unsubscribeEvent = `${rootKey}:unsubscribe`;

            socket.emit(subscribeEvent, { itemId });

            return () => {
                socket.emit(unsubscribeEvent, { itemId });
            };
        }, [itemId, queryClient]);
    };

    // ------------------ ✅ CACHE MANAGEMENT ------------------ //
    const useCacheManager = () => {
        const queryClient = useQueryClient();

        return {
            clearCache: useCallback(() => {
                queryClient.removeQueries({ queryKey: [rootKey] });
            }, [queryClient]),

            refreshCache: useCallback(async () => {
                await queryClient.refetchQueries({ queryKey: [rootKey] });
            }, [queryClient]),

            getCacheSize: useCallback(() => {
                const cache = queryClient.getQueryCache();
                return cache.getAll().filter(query =>
                    Array.isArray(query.queryKey) && query.queryKey[0] === rootKey
                ).length;
            }, [queryClient]),

            preloadItem: useCallback((id: string) => {
                if (services.fetchOne) {
                    queryClient.prefetchQuery({
                        queryKey: [rootKey, id],
                        queryFn: () => services.fetchOne!(id),
                        staleTime,
                    });
                }
            }, [queryClient]),
        };
    };

    // ------------------ ✅ OPTIMISTIC UPDATE UTILITIES ------------------ //
    const useOptimisticState = <K extends keyof T>(itemId: string, field: K) => {
        const queryClient = useQueryClient();

        const updateOptimistically = useCallback((newValue: T[K]) => {
            queryClient.setQueryData<T[]>([rootKey], (old = []) =>
                old.map((item) =>
                    item._id === itemId ? { ...item, [field]: newValue } : item
                )
            );

            queryClient.setQueryData<T>([rootKey, itemId], (old) =>
                old ? { ...old, [field]: newValue } : old
            );
        }, [itemId, field, queryClient]);

        return { updateOptimistically };
    };

    // ------------------ ✅ ERROR RECOVERY ------------------ //
    const useErrorRecovery = () => {
        const queryClient = useQueryClient();

        return {
            retryFailedQueries: useCallback(() => {
                queryClient.refetchQueries({
                    queryKey: [rootKey],
                    type: 'all',
                    stale: true,
                });
            }, [queryClient]),

            resetErrorBoundary: useCallback(() => {
                queryClient.resetQueries({ queryKey: [rootKey] });
            }, [queryClient]),
        };
    };

    // ------------------ ✅ PERFORMANCE MONITORING ------------------ //
    const usePerformanceMetrics = () => {
        const startTime = useRef(Date.now());
        const queryClient = useQueryClient();

        return useMemo(() => {
            const queries = queryClient.getQueryCache().getAll()
                .filter(query => Array.isArray(query.queryKey) && query.queryKey[0] === rootKey);

            return {
                queriesCount: queries.length,
                stalequeries: queries.filter(q => q.isStale()).length,
                uptime: Date.now() - startTime.current,
                cacheHitRate: queries.length > 0
                    ? queries.filter(q => q.state.dataUpdatedAt > 0).length / queries.length
                    : 0,
            };
        }, [queryClient]);
    };

    // ------------------ ✅ EXPORT ENHANCED API ------------------ //
    return {
        // Core CRUD operations
        useAll,
        useOne,
        useCreate,
        useUpdate,
        useDelete,

        // Bulk operations
        useBulkCreate,
        useBulkUpdate,
        useBulkDelete,

        // Filtering and querying
        useFilter,
        useSearch,
        useSort,
        useGroupBy,
        usePagination,

        // Real-time features
        useSubscribe,

        // Cache management
        useCacheManager,
        useInvalidate,
        usePrefetch,
        useReset,

        // Utilities
        useStats,
        useOptimisticState,
        useErrorRecovery,
        usePerformanceMetrics,

        // Auto-generated derived hooks
        ...derivedHooks,

        // Direct access to config for debugging
        _config: config,
        _rootKey: rootKey,
    };
}

// ------------------ ✅ PRESET CONFIGURATIONS ------------------ //
export const createStandardResourceHooks = <T extends BaseEntity>(
    rootKey: string,
    services: CrudServices<T>
) => createResourceHooks<T>({
    rootKey,
    services,
    cacheStrategy: {
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
    },
    optimisticUpdates: {
        enabled: true,
        timeout: 5000,
        fallbackOnError: true,
    },
    errorHandling: {
        logErrors: true,
        retryConfig: {
            maxRetries: 2,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
        },
    },
    performance: {
        debounceFilters: 300,
        memoizeFilters: true,
        enablePrefetch: true,
    },
});

export const createRealtimeResourceHooks = <T extends BaseEntity>(
    rootKey: string,
    services: CrudServices<T>,
    socketEvents: SocketEvent<any>[]
) => createResourceHooks<T>({
    rootKey,
    services,
    socketEvents,
    cacheStrategy: {
        staleTime: 30 * 1000, // More frequent updates for real-time
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        refetchInterval: 30 * 1000,
    },
    optimisticUpdates: {
        enabled: true,
        timeout: 3000, // Shorter timeout for real-time
        fallbackOnError: true,
    },
    errorHandling: {
        logErrors: true,
        showNotifications: true,
    },
});

export const createHighPerformanceResourceHooks = <T extends BaseEntity>(
    rootKey: string,
    services: CrudServices<T>
) => createResourceHooks<T>({
    rootKey,
    services,
    cacheStrategy: {
        staleTime: 15 * 60 * 1000, // Longer cache for performance
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    },
    optimisticUpdates: {
        enabled: true,
        timeout: 10000,
        fallbackOnError: false, // Trust optimistic updates more
    },
    performance: {
        debounceFilters: 500,
        memoizeFilters: true,
        enablePrefetch: true,
        enableVirtualization: true,
    },
});

// ------------------ ✅ HOOK COMPOSITION UTILITIES ------------------ //
export const combineResourceHooks = <T extends Record<string, any>>(hooks: T): T => {
    return hooks;
};

export const createResourceMiddleware = <T extends BaseEntity>(
    configs: MiddlewareConfig<T>[]
) => {
    return configs.map(config => createResourceHooks(config));
};

// ------------------ ✅ TYPE EXPORTS ------------------ //
export type {
    BaseEntity,
    ApiResponse,
    CrudServices,
    SocketEvent,
    DerivedQuery,
    MiddlewareConfig,
    CacheStrategy,
    OptimisticUpdateConfig,
    ErrorHandlingConfig,
    PerformanceConfig,
    FilterParams,
    PaginationParams,
    ResourceError,
};