import { useState, useCallback } from "react";
import { Event } from "../types";

export const useRatings = (initialEvents: Event[] = [], currentUserId?: string) => {
    const [events, setEvents] = useState<Event[]>(
        initialEvents.map(ev => ({
            ...ev,
            rating: Array.isArray(ev.rating) ? ev.rating : [],
        }))
    );

    const getUserRating = useCallback((event: Event) => {
        if (!event || !currentUserId) return { score: 0 };
        return event.rating?.find(r => r.ratingBy === currentUserId) || { score: 0 };
    }, [currentUserId]);

    const updateUserRating = useCallback((eventIndex: number, newScore: number) => {
        if (!currentUserId) return;
        
        setEvents(prevEvents => {
            const updated = [...prevEvents];
            const event = updated[eventIndex];
            if (!event) return updated;

            const existingIndex = event.rating.findIndex(r => r.ratingBy === currentUserId);
            
            if (existingIndex > -1) {
                event.rating[existingIndex] = { ratingBy: currentUserId, score: newScore };
            } else {
                event.rating.push({ ratingBy: currentUserId, score: newScore });
            }
            return updated;
        });
    }, [currentUserId]);

    return {
        events,
        setEvents,
        getUserRating,
        updateUserRating,
    };
};
