import { getColor } from '@/src/constants/colors';
import React from 'react';
import { View, Pressable, StyleSheet, Dimensions } from 'react-native';
import BackIcon from '../../icons/BackIcon';
import Typography from '../../typography/Typography';
import { islamicMonths } from '@/src/utils/calanderUtils';

const { width: DEVICE_WIDTH } = Dimensions.get('window');

interface MonthNavigationProps {
    currentMonth: number;
    currentYear: number;
    onPreviousMonth: () => void;
    onNextMonth: () => void;
    disabled?: boolean;
}

const MonthNavigation: React.FC<MonthNavigationProps> = ({
    currentMonth,
    currentYear,
    onPreviousMonth,
    onNextMonth,
    disabled = false,
}) => {
    return (
        <View style={styles.container}>
            <Pressable
                onPress={onPreviousMonth}
                accessibilityLabel="Previous month"
                disabled={disabled}
            >
                <BackIcon size={16} color={getColor("dark", 700)} />
            </Pressable>

            <Typography
                variant="h5"
                style={[styles.monthText, { fontSize: DEVICE_WIDTH < 360 ? 16 : 18 }]}
                numberOfLines={1}
            >
                {islamicMonths[currentMonth]} {currentYear}
            </Typography>

            <Pressable
                onPress={onNextMonth}
                style={styles.nextButton}
                accessibilityLabel="Next month"
                disabled={disabled}
            >
                <BackIcon size={16} color={getColor("dark", 700)} />
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    monthText: {
        textAlign: 'center',
        flex: 1,
        marginHorizontal: 16,
    },
    nextButton: {
        transform: [{ rotate: "180deg" }],
    },
});

export default MonthNavigation;