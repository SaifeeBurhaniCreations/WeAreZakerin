import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import { Toast } from '../utils/Toast';

export const useDateTimePickers = (eventForm: any) => {
    const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
    const [showStartPicker, setShowStartPicker] = useState<boolean>(false);

    const handleDateConfirm = useCallback((selectedDate: Date) => {
        try {
            setShowDatePicker(false);
            if (selectedDate && selectedDate instanceof Date && !isNaN(selectedDate.getTime())) {
                const formatted = format(selectedDate, 'MMM dd, yyyy');
                eventForm.setDate(formatted);
            } else {
                throw new Error('Invalid date selected');
            }
        } catch (error) {
            console.error('Error confirming date:', error);
            Toast.show({
                title: 'Date Error',
                description: 'Failed to set date',
                variant: 'error',
            });
        }
    }, [eventForm]);

    const handleStartTimeChange = useCallback((_: any, time?: Date) => {
        try {
            setShowStartPicker(false);
            if (time && time instanceof Date && !isNaN(time.getTime())) {
                eventForm.setSelectedStartTime(time);
            }
        } catch (error) {
            console.error('Error setting start time:', error);
            Toast.show({
                title: 'Time Error',
                description: 'Failed to set time',
                variant: 'error',
            });
        }
    }, [eventForm]);

    const handleDateCancel = useCallback(() => {
        setShowDatePicker(false);
    }, []);

    return {
        showDatePicker,
        setShowDatePicker,
        showStartPicker,
        setShowStartPicker,
        handleDateConfirm,
        handleStartTimeChange,
        handleDateCancel,
    };
};