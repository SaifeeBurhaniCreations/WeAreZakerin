import { useState, useCallback, useEffect } from 'react';
import { Toast } from '../utils/Toast';
import { normalizeEvents } from '../utils/eventUtils';
import { initialIslamicEvents } from '../constants/event';
import { eventProps, miqaatProps } from '../types';
import dayjs from 'dayjs';
import { Occassion } from '../redux/slices/OccassionSlice';

export const useEventManagement = (eventSwitchValue: boolean) => {
    const [islamicEvents, setIslamicEvents] = useState<eventProps[]>(() => {
        try {
            return normalizeEvents(initialIslamicEvents);
        } catch (error) {
            console.error('Error normalizing events:', error);
            return [];
        }
    });

    const getEventsForDate = useCallback((monthIndex: number, day: number): miqaatProps[] => {
        try {
            if (!islamicEvents || !Array.isArray(islamicEvents)) return [];
            return islamicEvents.find(event => event.month === monthIndex && event.date === day)?.miqaats || [];
        } catch (error) {
            console.error('Error getting events for date:', error);
            return [];
        }
    }, [islamicEvents]);

    const createEvent = useCallback(async (event: Occassion) => {
        try {
            if (!event || typeof event !== 'object') {
                throw new Error('Invalid event object');
            }

            const newEvent: eventProps = {
                month: event?.hijri_date?.month || 0,
                date: event?.hijri_date?.day || 1,
                miqaats: [
                    {
                        title: event?.name || 'Unknown Event',
                        description: `${event?.description || 'No description'} - ${dayjs(event.start_at).format("hh:mm A")}`,
                        location: event?.location || 'No location',
                        priority: 2,
                        phase: eventSwitchValue ? "day" : "night",
                        year: null,
                    },
                ],
            };

            setIslamicEvents(prevEvents => {
                try {
                    const existingIndex = prevEvents.findIndex(
                        event => event.month === newEvent.month && event.date === newEvent.date
                    );

                    let updatedEvents: eventProps[];

                    if (existingIndex !== -1) {
                        updatedEvents = [...prevEvents];
                        updatedEvents[existingIndex].miqaats.push(newEvent.miqaats[0]);
                    } else {
                        updatedEvents = [...prevEvents, newEvent];
                    }

                    return updatedEvents.sort((a, b) => {
                        if (a.month !== b.month) return a.month - b.month;
                        return a.date - b.date;
                    });
                } catch (error) {
                    console.error('Error updating events:', error);
                    return prevEvents;
                }
            });

        } catch (error) {
            console.error("Event creation error:", error);
            Toast.show({
                title: 'Event Creation Error',
                description: 'Failed to create event. Please try again.',
                variant: 'error',
            });
        }
    }, [eventSwitchValue]);

    return {
        islamicEvents,
        setIslamicEvents,
        getEventsForDate,
        createEvent,
    };
};