import { useState, useMemo, useCallback } from 'react';
import { getIslamicDate, getIslamicMonthLengths, getGregorianDateFromIslamic } from '../utils/calanderUtils';
import { CalendarState } from '../types';

export const useCalendarState = () => {
    const today = useMemo(() => new Date(), []);
    const todayIslamic = useMemo(() => {
        try {
            const islamic = getIslamicDate(today);
            if (!islamic) throw new Error('Failed to get Islamic date');
            return islamic;
        } catch (error) {
            console.error('Error getting Islamic date:', error);
            return { year: 1445, monthIndex: 0, day: 1 };
        }
    }, [today]);

    const [state, setState] = useState<CalendarState>({
        currentIslamicYear: todayIslamic.year,
        currentIslamicMonthIndex: todayIslamic.monthIndex,
        selectedDay: 1,
        selectedDateString: "",
        hasError: false,
        errorMessage: '',
    });

    const monthLengths = useMemo(() => {
        try {
            return getIslamicMonthLengths(state.currentIslamicYear);
        } catch (error) {
            console.error('Error getting month lengths:', error);
            return Array(12).fill(29);
        }
    }, [state.currentIslamicYear]);

    const totalDays = useMemo(() => {
        try {
            return monthLengths[state.currentIslamicMonthIndex] || 29;
        } catch (error) {
            console.error('Error getting total days:', error);
            return 29;
        }
    }, [monthLengths, state.currentIslamicMonthIndex]);

    const startDate = useMemo(() => {
        try {
            return getGregorianDateFromIslamic(state.currentIslamicYear, state.currentIslamicMonthIndex, 1);
        } catch (error) {
            console.error('Error getting start date:', error);
            return new Date();
        }
    }, [state.currentIslamicYear, state.currentIslamicMonthIndex]);

    const startDay = useMemo(() => {
        try {
            return startDate.getDay();
        } catch (error) {
            console.error('Error getting start day:', error);
            return 0;
        }
    }, [startDate]);

    const changeIslamicMonth = useCallback((offset: number) => {
        try {
            setState(prev => {
                const newIndex = prev.currentIslamicMonthIndex + offset;
                if (newIndex < 0) {
                    return {
                        ...prev,
                        currentIslamicYear: Math.max(prev.currentIslamicYear - 1, 1400),
                        currentIslamicMonthIndex: 11,
                    };
                } else if (newIndex > 11) {
                    return {
                        ...prev,
                        currentIslamicYear: Math.min(prev.currentIslamicYear + 1, 1500),
                        currentIslamicMonthIndex: 0,
                    };
                }
                return { ...prev, currentIslamicMonthIndex: newIndex };
            });
        } catch (error) {
            console.error('Error changing Islamic month:', error);
        }
    }, []);

    const goToToday = useCallback(() => {
        try {
            const todayIslamic = getIslamicDate(new Date());
            if (!todayIslamic) throw new Error('Failed to get today\'s Islamic date');
            setState(prev => ({
                ...prev,
                currentIslamicYear: todayIslamic.year,
                currentIslamicMonthIndex: todayIslamic.monthIndex,
            }));
        } catch (error) {
            console.error('Error going to today:', error);
        }
    }, []);

    const setSelectedDay = useCallback((day: number) => {
        setState(prev => ({ ...prev, selectedDay: day }));
    }, []);

    const setSelectedDateString = useCallback((dateString: string) => {
        setState(prev => ({ ...prev, selectedDateString: dateString }));
    }, []);

    const setError = useCallback((hasError: boolean, errorMessage: string = '') => {
        setState(prev => ({ ...prev, hasError, errorMessage }));
    }, []);

    return {
        ...state,
        today,
        monthLengths,
        totalDays,
        startDate,
        startDay,
        changeIslamicMonth,
        goToToday,
        setSelectedDay,
        setSelectedDateString,
        setError,
    };
};