import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Typography from '../../typography/Typography';
import { getColor } from '@/src/constants/colors';

interface CalendarHeaderProps {
    onGoToDate: () => void;
    onGoToToday: () => void;
    responsive: { headerButtonMinWidth: number; headerSpacing: number };
    disabled?: boolean;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
    onGoToDate,
    onGoToToday,
    responsive,
    disabled = false,
}) => {
    return (
        <View style={[styles.header, { marginBottom: responsive.headerSpacing }]}>
            <TouchableOpacity
                style={[styles.headerButton, { minWidth: responsive.headerButtonMinWidth }]}
                onPress={onGoToDate}
                accessibilityLabel="Go to specific date"
                disabled={disabled}
            >
                <Typography variant="b4" color={getColor("light", 100)} numberOfLines={1}>
                    Go to Date
                </Typography>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.headerButton, { minWidth: responsive.headerButtonMinWidth }]}
                onPress={onGoToToday}
                accessibilityLabel="Go to today"
                disabled={disabled}
            >
                <Typography variant="b4" color={getColor("light", 100)} numberOfLines={1}>
                    Today
                </Typography>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
    },
    headerButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: getColor("green"),
        borderRadius: 8,
        alignItems: 'center',
    },
});

export default CalendarHeader;