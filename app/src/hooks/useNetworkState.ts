import { useState, useCallback, useEffect } from 'react';

export const useNetworkState = (occasionError: any, refetchOccasions: () => Promise<any>) => {
    const [networkError, setNetworkError] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

    useEffect(() => {
        if (occasionError) {
            setNetworkError('Failed to load occasions. Please check your connection.');
            console.error('Occasion error:', occasionError);
        } else {
            setNetworkError(null);
        }
    }, [occasionError]);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await refetchOccasions();
            setNetworkError(null);
        } catch (error) {
            console.error('Error refreshing:', error);
            setNetworkError('Failed to refresh. Please try again.');
        } finally {
            setIsRefreshing(false);
        }
    }, [refetchOccasions]);

    return {
        networkError,
        isRefreshing,
        handleRefresh,
    };
};