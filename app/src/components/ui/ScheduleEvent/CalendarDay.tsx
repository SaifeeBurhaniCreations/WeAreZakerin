import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Typography from '../../typography/Typography';
import { getColor } from '@/src/constants/colors';
import { months, toArabicNumerals } from '@/src/utils/calanderUtils';
import { CalendarDay } from '@/src/types';

interface CalendarDayProps {
    dayData: CalendarDay;
    currentIslamicMonthIndex: number;
    currentIslamicYear: number;
    onPress: (dateString: string, islamicDay: number) => void;
    responsive: { gridGap: number; dayFontSize: number };
    disabled?: boolean;
}

const CalendarDay: React.FC<CalendarDayProps> = ({
    dayData,
    currentIslamicMonthIndex,
    currentIslamicYear,
    onPress,
    responsive,
    disabled = false,
}) => {
    const { date, islamicDate, dateString, isToday, isSelected, events, highestPriority } = dayData;

    return (
        <TouchableOpacity
            style={[
                styles.dayCell,
                isToday && styles.today,
                isSelected && styles.selected,
                { minHeight: responsive.gridGap * 8 }
            ]}
            onPress={() => onPress(dateString, islamicDate.day)}
            accessibilityLabel={`${islamicDate.day} Islamic date, ${date.getDate()} ${months[date.getMonth()]}`}
            accessibilityHint={events.length > 0 ? `${events.length} events` : "No events, tap to create"}
            disabled={disabled}
        >
            <Typography
                variant="b3"
                style={[
                    {
                        color: highestPriority === 1
                            ? getColor("red", 400)
                            : highestPriority === 2 || highestPriority === 3
                                ? getColor("blue", 400)
                                : getColor("dark", 700),
                    },
                ]}
                numberOfLines={1}
            >
                {toArabicNumerals(islamicDate.day)}
            </Typography>
            <Typography
                variant="b5"
                style={{
                    color: getColor("dark", 700),
                    fontSize: responsive.dayFontSize - 2
                }}
                numberOfLines={1}
            >
                {date.getDate()} {months[date.getMonth()].slice(0, 3)}
            </Typography>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    dayCell: {
        width: '14.285%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0.5,
        borderColor: getColor("light", 200),
        backgroundColor: getColor("light", 100),
        padding: 4,
    },
    today: {
        backgroundColor: getColor("blue", 100),
        borderColor: getColor("blue", 300),
        borderWidth: 2,
    },
    selected: {
        backgroundColor: getColor("blue", 200),
        borderColor: getColor("blue", 400),
        borderWidth: 2,
    },
});

export default CalendarDay;