import { useCallback, useEffect, useRef } from "react";
import { socket } from "../lib/socket";
import { QUERY_KEYS } from "../constants/queryKeys";
import { Occassion } from "../redux/slices/OccassionSlice";

// Socket event types
type SocketOccasionEvent = {
    occasion: Occassion;
    timestamp: Date;
};

type SocketDeleteEvent = {
    occasionId: string;
    timestamp: Date;
};

type SocketAttendanceEvent = {
    attendance: any;
    timestamp: Date;
};

type SocketGroupedEvent = {
    groupedParties: any[];
    timestamp: Date;
};

// Debounce utility for socket events
const useDebounce = (callback: Function, delay: number) => {
    const debounceRef = useRef<NodeJS.Timeout>();
    
    return useCallback((...args: any[]) => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => callback(...args), delay);
    }, [callback, delay]);
};

// Socket listener hook for occasions
export const useSocketListeners = (queryClient: any) => {
    const lastUpdateRef = useRef<{ [key: string]: number }>({});
    
    // Debounced cache update to prevent excessive re-renders
    const debouncedInvalidate = useDebounce((queryKey: any[]) => {
        queryClient.invalidateQueries({ queryKey });
    }, 100);

    // Validation helper to prevent stale updates
    const isValidUpdate = (eventId: string, timestamp: Date): boolean => {
        const eventTime = new Date(timestamp).getTime();
        const lastUpdate = lastUpdateRef.current[eventId] || 0;
        
        if (eventTime > lastUpdate) {
            lastUpdateRef.current[eventId] = eventTime;
            return true;
        }
        return false;
    };

    useEffect(() => {
        // Replace 'socket' with your actual socket instance
        if (typeof window !== 'undefined' && socket) {

            // 1. Occasion Created
            const handleOccasionCreated = (data: SocketOccasionEvent) => {
                const eventId = `created_${data.occasion._id}`;
                if (!isValidUpdate(eventId, data.timestamp)) return;

                // Optimistically update cache
                queryClient.setQueryData(QUERY_KEYS.occasions, (old: Occassion[] = []) => {
                    // Prevent duplicates
                    const exists = old.find(item => item._id === data.occasion._id);
                    if (exists) return old;
                    
                    return [data.occasion, ...old];
                });

                // Update related caches
                queryClient.setQueryData(QUERY_KEYS.occasion(data.occasion._id!), data.occasion);
                
                // Invalidate date/month/year specific queries if needed
                debouncedInvalidate(QUERY_KEYS.occasions);
            };

            // 2. Occasion Updated
            const handleOccasionUpdated = (data: SocketOccasionEvent) => {
                const eventId = `updated_${data.occasion._id}`;
                if (!isValidUpdate(eventId, data.timestamp)) return;

                // Update main occasions list
                queryClient.setQueryData(QUERY_KEYS.occasions, (old: Occassion[] = []) =>
                    old.map(item =>
                        item._id === data.occasion._id ? { ...item, ...data.occasion } : item
                    )
                );

                // Update individual occasion cache
                queryClient.setQueryData(QUERY_KEYS.occasion(data.occasion._id!), data.occasion);

            };

            // 3. Occasion Deleted
            const handleOccasionDeleted = (data: SocketDeleteEvent) => {
                const eventId = `deleted_${data.occasionId}`;
                if (!isValidUpdate(eventId, data.timestamp)) return;

                // Remove from main occasions list
                queryClient.setQueryData(QUERY_KEYS.occasions, (old: Occassion[] = []) =>
                    old.filter(item => item._id !== data.occasionId)
                );

                // Remove individual occasion cache
                queryClient.removeQueries({ queryKey: QUERY_KEYS.occasion(data.occasionId) });

                // Clean up related caches
                queryClient.invalidateQueries({ 
                    predicate: (query: any) => {
                        const key = query.queryKey[0];
                        return key === 'occasions' && query.queryKey.length > 1;
                    }
                });
            };

            // 4. Attendance Updated
            const handleAttendanceUpdated = (data: SocketAttendanceEvent) => {
                const eventId = `attendance_${data.attendance.occasionId || Date.now()}`;
                if (!isValidUpdate(eventId, data.timestamp)) return;

                // Update occasion with new attendance data
                if (data.attendance.occasionId) {
                    queryClient.setQueryData(
                        QUERY_KEYS.occasion(data.attendance.occasionId),
                        (old: Occassion) => old ? { ...old, attendance: data.attendance } : old
                    );

                    // Update in main occasions list
                    queryClient.setQueryData(QUERY_KEYS.occasions, (old: Occassion[] = []) =>
                        old.map(item =>
                            item._id === data.attendance.occasionId
                                ? { ...item, attendance: data.attendance }
                                : item
                        )
                    );
                }
            };

            // 5. Events Grouped
            const handleEventsGrouped = (data: SocketGroupedEvent) => {
                const eventId = `grouped_${Date.now()}`;
                if (!isValidUpdate(eventId, data.timestamp)) return;

                // Update grouped occasions cache
                queryClient.setQueryData(QUERY_KEYS.occasionGroups, data.groupedParties);
                
                // Optionally invalidate related queries
                debouncedInvalidate(QUERY_KEYS.occasionGroups);
            };

            // 6. All Occasions Fetched (bulk update)
            const handleOccasionsFetched = (data: { occasions: Occassion[], timestamp: Date }) => {
                const eventId = `fetched_all_${Date.now()}`;
                if (!isValidUpdate(eventId, data.timestamp)) return;

                // Replace entire occasions cache (use cautiously)
                queryClient.setQueryData(QUERY_KEYS.occasions, data.occasions);
                
                // Update individual occasion caches
                data.occasions.forEach(occasion => {
                    queryClient.setQueryData(QUERY_KEYS.occasion(occasion._id!), occasion);
                });
            };

            // Register event listeners
            socket.on('occasion:created', handleOccasionCreated);
            socket.on('occasion:updated', handleOccasionUpdated);
            socket.on('occasion:deleted', handleOccasionDeleted);
            socket.on('occasion:attendance-updated', handleAttendanceUpdated);
            socket.on('occasion:events-grouped', handleEventsGrouped);
            socket.on('occasion:fetched-all', handleOccasionsFetched);

            // Cleanup listeners
            return () => {
                socket.off('occasion:created', handleOccasionCreated);
                socket.off('occasion:updated', handleOccasionUpdated);
                socket.off('occasion:deleted', handleOccasionDeleted);
                socket.off('occasion:attendance-updated', handleAttendanceUpdated);
                socket.off('occasion:events-grouped', handleEventsGrouped);
                socket.off('occasion:fetched-all', handleOccasionsFetched);
            };
        }
    }, [queryClient, debouncedInvalidate]);
};