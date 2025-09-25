import { AddDataModalRef, miqaatProps } from '@/src/types';
import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import BottomSheetModal from '../modals/BottomSheetModal';
import CircleIcon from '../../icons/CircleIcon';
import Typography from '../../typography/Typography';
import { getColor } from '@/src/constants/colors';

interface EventDetailsModalProps {
    ref: React.RefObject<AddDataModalRef>;
    title: string;
    events: miqaatProps[];
    onAssignParty: () => void;
    isSubmitting: boolean;
    maxHeight: number;
}

const EventDetailsModal = React.forwardRef<AddDataModalRef, EventDetailsModalProps>(
    ({ title, events, onAssignParty, isSubmitting, maxHeight }, ref) => {
        return (
            <BottomSheetModal
                title={title}
                ref={ref}
                onPress={onAssignParty}
                footer="Assign Party"
                disabled={isSubmitting}
            >
                <ScrollView
                    style={{ maxHeight: maxHeight * 0.6 }}
                    showsVerticalScrollIndicator={false}
                >
                    {events.map((event, index) => (
                        <View key={`event-${index}`} style={styles.eventCard}>
                            <CircleIcon />
                            <View style={[styles.eventContent, { flex: 1, minWidth: 0 }]}>
                                <Typography
                                    variant="b4"
                                    style={{ color: getColor('dark', 700) }}
                                    numberOfLines={2}
                                >
                                    {event.title} - {event.description || 'No description'}
                                </Typography>
                                {event.location && (
                                    <Typography
                                        variant="b5"
                                        style={{ color: getColor('dark', 500) }}
                                        numberOfLines={1}
                                    >
                                        📍 {event.location}
                                    </Typography>
                                )}
                            </View>
                        </View>
                    ))}
                </ScrollView>
            </BottomSheetModal>
        );
    }
);

const styles = StyleSheet.create({
    eventCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        shadowColor: getColor("dark", 400),
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        padding: 12,
        marginVertical: 4,
        backgroundColor: getColor("light", 100),
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: getColor("blue", 400),
        gap: 12,
    },
    eventContent: {
        flexDirection: 'column',
        gap: 4,
    },
});

export default EventDetailsModal;