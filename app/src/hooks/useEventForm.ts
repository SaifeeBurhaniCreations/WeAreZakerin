import { useState, useCallback } from 'react';
import { Assignment, ValidationErrors } from '../types';

const INITIAL_ASSIGNMENT: Assignment = { name: "", party: "" };

export const useEventForm = () => {
    const [eventName, setEventName] = useState<string>("");
    const [eventDescription, setEventDescription] = useState<string>("");
    const [eventLocation, setEventLocation] = useState<string>("");
    const [eventSwitchValue, setEventSwitchValue] = useState<boolean>(false);
    const [date, setDate] = useState<string>("");
    const [selectedStartTime, setSelectedStartTime] = useState<Date | null>(null);
    const [assignments, setAssignments] = useState<Assignment[]>([{ ...INITIAL_ASSIGNMENT }]);
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isInstant, setIsInstant] = useState<boolean>(false);

    const resetForm = useCallback(() => {
        try {
            setEventName("");
            setEventDescription("");
            setEventLocation("");
            setEventSwitchValue(false);
            setDate("");
            setSelectedStartTime(null);
            setAssignments([{ ...INITIAL_ASSIGNMENT }]);
            setValidationErrors({});
            setIsInstant(false);
        } catch (error) {
            console.error('Error resetting form:', error);
        }
    }, []);

    const validateEventForm = useCallback((): ValidationErrors => {
        const errors: ValidationErrors = {};

        try {
            if (!eventName?.trim()) {
                errors.eventName = "Event name is required";
            } else if (eventName.trim().length < 2) {
                errors.eventName = "Event name must be at least 2 characters";
            } else if (eventName.trim().length > 100) {
                errors.eventName = "Event name must be less than 100 characters";
            }

            if (!eventDescription?.trim()) {
                errors.eventDescription = "Event description is required";
            } else if (eventDescription.trim().length < 5) {
                errors.eventDescription = "Event description must be at least 5 characters";
            } else if (eventDescription.trim().length > 500) {
                errors.eventDescription = "Event description must be less than 500 characters";
            }

            if (!eventLocation?.trim()) {
                errors.eventLocation = "Event location is required";
            } else if (eventLocation.trim().length > 200) {
                errors.eventLocation = "Event location must be less than 200 characters";
            }

            if (!date) {
                errors.date = "Event date is required";
            }

            if (!selectedStartTime) {
                errors.selectedStartTime = "Event start time is required";
            } else {
                const now = new Date();
                const eventDateTime = new Date(date);
                eventDateTime.setHours(selectedStartTime.getHours(), selectedStartTime.getMinutes());

                if (eventDateTime < now) {
                    errors.selectedStartTime = "Event time cannot be in the past";
                }
            }

            if (!assignments || assignments.length === 0) {
                errors.assignments = "At least one assignment is required";
            } else {
                const hasEmptyAssignments = assignments.some(assignment =>
                    !assignment?.name?.trim() || !assignment?.party?.trim()
                );

                if (hasEmptyAssignments) {
                    errors.assignments = "All assignment fields must be filled";
                } else {
                    const assignmentKeys = assignments.map(a => `${a.name}-${a.party}`);
                    const uniqueAssignments = new Set(assignmentKeys);
                    if (assignmentKeys.length !== uniqueAssignments.size) {
                        errors.assignments = "Duplicate assignments are not allowed";
                    }
                }
            }
        } catch (error) {
            console.error('Validation error:', error);
            errors.general = "Validation failed. Please check your inputs.";
        }

        return errors;
    }, [eventName, eventDescription, eventLocation, date, selectedStartTime, assignments]);

    return {
        eventName,
        setEventName,
        eventDescription,
        setEventDescription,
        eventLocation,
        setEventLocation,
        eventSwitchValue,
        setEventSwitchValue,
        date,
        setDate,
        selectedStartTime,
        setSelectedStartTime,
        assignments,
        setAssignments,
        validationErrors,
        setValidationErrors,
        isSubmitting,
        setIsSubmitting,
        isInstant,
        setIsInstant,
        resetForm,
        validateEventForm,
    };
};