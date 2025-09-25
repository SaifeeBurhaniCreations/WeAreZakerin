import React from 'react';
import { ScrollView, View, TouchableOpacity, StyleSheet } from 'react-native';
import dayjs from 'dayjs';
import { AddDataModalRef, CalendarState, EventFormType } from '@/src/types';
import { RootState } from '@/src/redux/store';
import { useSelector } from 'react-redux';
import BottomSheetModal from '../modals/BottomSheetModal';
import Typography from '../../typography/Typography';
import { getColor } from '@/src/constants/colors';
import Input from '../Input';
import Button from '../Button';
import Select from '../Select';
import { KALAM_OPTIONS } from '@/src/utils/common';
import CrossIcon from '../../icons/CrossIcon';

interface CreateEventModalProps {
    ref: React.RefObject<AddDataModalRef>;
    title: string;
    eventForm: EventFormType;
    onSubmit: () => void;
    responsive: { modalMaxHeight: number };
    calendarState: CalendarState;
    onShowDatePicker: () => void;
    onShowTimePicker: () => void;
}

const CreateEventModal = React.forwardRef<AddDataModalRef, CreateEventModalProps>(
    ({ title, eventForm, onSubmit, responsive, calendarState, onShowDatePicker, onShowTimePicker }, ref) => {
        const { groups } = useSelector((state: RootState) => state.party);

        const groupOptions = React.useMemo(() => {
            try {
                return groups?.map(group => ({
                    label: group?.name || 'Unknown',
                    value: group?._id || ''
                })).filter(option => option.value) || [];
            } catch (error) {
                console.error('Error creating group options:', error);
                return [];
            }
        }, [groups]);

        const handleAddAssignment = () => {
            try {
                if (eventForm.assignments.length >= 10) {
                    return;
                }
                eventForm.setAssignments(prev => [...prev, { name: "", party: "" }]);
            } catch (error) {
                console.error('Error adding assignment:', error);
            }
        };

        const handleRemoveAssignment = (index: number) => {
            try {
                if (eventForm.assignments.length <= 1) return;
                if (index < 0 || index >= eventForm.assignments.length) return;
                eventForm.setAssignments(prev => prev.filter((_, i) => i !== index));
            } catch (error) {
                console.error('Error removing assignment:', error);
            }
        };

        const handleAssignmentChange = (index: number, field: string, value: string) => {
            try {
                if (index < 0 || index >= eventForm.assignments.length) return;
                eventForm.setAssignments(prev =>
                    prev.map((assignment, i) =>
                        i === index ? { ...assignment, [field]: value.trim() } : assignment
                    )
                );
            } catch (error) {
                console.error('Error updating assignment:', error);
            }
        };

        return (
            <BottomSheetModal
                title={title}
                ref={ref}
                footer={eventForm.isSubmitting ? "Creating..." : "Create Event"}
                onPress={onSubmit}
                disabled={eventForm.isSubmitting || calendarState.hasError}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    style={{ maxHeight: responsive.modalMaxHeight * 0.8 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.formContainer}>
                        {/* General Error */}
                        {eventForm.validationErrors.general && (
                            <View style={styles.errorContainer}>
                                <Typography variant="b5" color={getColor("red", 400)}>
                                    {eventForm.validationErrors.general}
                                </Typography>
                            </View>
                        )}

                        <Input
                            placeholder='Enter event name'
                            value={eventForm.eventName}
                            onChangeText={eventForm.setEventName}
                            error={eventForm.validationErrors.eventName}
                            maxLength={100}
                            editable={!eventForm.isSubmitting}
                        >
                            Event Name *
                        </Input>

                        <Input
                            placeholder='Enter event description'
                            value={eventForm.eventDescription}
                            onChangeText={eventForm.setEventDescription}
                            multiline
                            numberOfLines={3}
                            error={eventForm.validationErrors.eventDescription}
                            maxLength={500}
                            editable={!eventForm.isSubmitting}
                        >
                            Event Description *
                        </Input>

                        <View style={styles.assignmentsHeader}>
                            <Typography variant="h5">Assign Kalams *</Typography>
                            <Button
                                variant="outline"
                                size="sm"
                                onPress={handleAddAssignment}
                                disabled={eventForm.assignments.length >= 10 || eventForm.isSubmitting}
                            >
                                Add ({eventForm.assignments.length}/10)
                            </Button>
                        </View>

                        {eventForm.validationErrors.assignments && (
                            <Typography variant="b5" color={getColor("red", 400)}>
                                {eventForm.validationErrors.assignments}
                            </Typography>
                        )}

                        {eventForm.assignments.map((item, index) => (
                            <View key={`assignment-${index}`} style={styles.assignmentRow}>
                                <Select
                                    options={KALAM_OPTIONS || []}
                                    style={{ flex: 0.8 }}
                                    value={item.name}
                                    onSelect={(val) => handleAssignmentChange(index, "name", val)}
                                    placeholder="Select Kalam"
                                    disabled={eventForm.isSubmitting}
                                />
                                <Select
                                    style={{ flex: 1 }}
                                    options={groupOptions}
                                    value={item.party}
                                    onSelect={(val) => handleAssignmentChange(index, "party", val)}
                                    placeholder="Assign Party"
                                    disabled={eventForm.isSubmitting}
                                />
                                {eventForm.assignments.length > 1 && (
                                    <TouchableOpacity
                                        onPress={() => handleRemoveAssignment(index)}
                                        disabled={eventForm.isSubmitting}
                                    >
                                        <CrossIcon />
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))}

                        {eventForm.isInstant && (
                            <Input
                                placeholder='Select start date'
                                mask="time"
                                value={eventForm.date ? eventForm.date : ""}
                                onFocus={onShowDatePicker}
                                onPress={onShowDatePicker}
                                showSoftInputOnFocus={false}
                                editable={!eventForm.isSubmitting}
                            >
                                Event Date *
                            </Input>
                        )}

                        <Input
                            placeholder='Select start time'
                            mask="time"
                            value={eventForm.selectedStartTime ? dayjs(eventForm.selectedStartTime).format("hh:mm A") : ""}
                            onFocus={onShowTimePicker}
                            onPress={onShowTimePicker}
                            showSoftInputOnFocus={false}
                            error={eventForm.validationErrors.selectedStartTime}
                            editable={!eventForm.isSubmitting}
                        >
                            Event Start Time *
                        </Input>

                        <Input
                            placeholder='Enter event location'
                            value={eventForm.eventLocation}
                            onChangeText={eventForm.setEventLocation}
                            error={eventForm.validationErrors.eventLocation}
                            maxLength={200}
                            editable={!eventForm.isSubmitting}
                        >
                            Event Location *
                        </Input>
                    </View>
                </ScrollView>
            </BottomSheetModal>
        );
    }
);

const styles = StyleSheet.create({
    formContainer: {
        gap: 16,
        paddingBottom: 20,
    },
    errorContainer: {
        backgroundColor: getColor("red", 50),
        padding: 12,
        borderRadius: 8,
    },
    assignmentsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    assignmentRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
    },
});

export default CreateEventModal;