import { daysOfWeek, getIslamicDate } from '@/src/utils/calanderUtils';
import React, { useMemo } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import Typography from '../../typography/Typography';
import { getColor } from '@/src/constants/colors';
import { CalendarDay as CalendarDayType  } from '@/src/types';
import CalendarDay from './CalendarDay';



interface CalendarGridProps {
    startDay: number;
    totalDays: number;
    startDate: Date;
    today: Date;
    selectedDateString: string;
    currentIslamicMonthIndex: number;
    getEventsForDate: (monthIndex: number, day: number) => any[];
    onDayPress: (dateString: string, islamicDay: number) => void;
    responsive: { calendarHeight: string; dayFontSize: number; gridGap: number };
    disabled?: boolean;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
    startDay,
    totalDays,
    startDate,
    today,
    selectedDateString,
    currentIslamicMonthIndex,
    getEventsForDate,
    onDayPress,
    responsive,
    disabled = false,
}) => {
    const calendarDays = useMemo(() => {
        const days: CalendarDayType[] = [];

        for (let i = 0; i < totalDays; i++) {
            try {
                const date = new Date(startDate);
                date.setDate(startDate.getDate() + i);
                const islamicDate = getIslamicDate(date);

                if (!islamicDate) continue;

                const dateString = date.toDateString();
                const isToday = dateString === today.toDateString();
                const isSelected = dateString === selectedDateString;
                const events = getEventsForDate(currentIslamicMonthIndex, islamicDate.day);
                const highestPriority = events.length > 0 ? Math.min(...events.map(event => event.priority || 4), 4) : 4;

                days.push({
                    date,
                    islamicDate,
                    dateString,
                    isToday,
                    isSelected,
                    events,
                    highestPriority,
                });
            } catch (dayError) {
                console.error(`Error processing day ${i}:`, dayError);
            }
        }

        return days;
    }, [startDay, totalDays, startDate, today, selectedDateString, getEventsForDate, currentIslamicMonthIndex]);

    const renderBlankCells = () => {
        const cells = [];
        for (let i = 0; i < startDay; i++) {
            cells.push(<View key={`blank-${i}`} style={[styles.dayCell, { backgroundColor: 'transparent' }]} />);
        }
        return cells;
    };

    return (
        <View style={[styles.calendar, { height: responsive.calendarHeight }]}>
            {/* Days of Week Header */}
            <View style={styles.daysOfWeek}>
                {daysOfWeek.map((day, idx) => (
                    <Typography
                        variant="b4"
                        key={idx}
                        color={getColor("dark", 700)}
                        style={[styles.dayLabel, { fontSize: responsive.dayFontSize }]}
                        numberOfLines={1}
                    >
                        {day}
                    </Typography>
                ))}
            </View>

            {/* Calendar Grid */}
            <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled>
                <View style={styles.grid}>
                    {renderBlankCells()}
                    {calendarDays.map((dayData, index) => (
                        <CalendarDay
                            key={`day-${index}`}
                            dayData={dayData}
                            currentIslamicMonthIndex={currentIslamicMonthIndex}
                            currentIslamicYear={0} // You'll need to pass this from parent
                            onPress={onDayPress}
                            responsive={responsive}
                            disabled={disabled}
                        />
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    calendar: {
        backgroundColor: getColor("light", 100),
        paddingVertical: 12,
        overflow: 'hidden',
        borderRadius: 12,
        gap: 8,
        flexDirection: 'column',
        shadowColor: getColor("dark", 400),
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
        elevation: 2,
    },
    daysOfWeek: {
        flexDirection: 'row',
        marginBottom: 10,
        paddingHorizontal: 4,
    },
    dayLabel: {
        flex: 1,
        textAlign: 'center',
        fontWeight: '600',
        paddingVertical: 8,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
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
});

export default CalendarGrid;