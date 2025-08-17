import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import Typography from "@/src/components/typography/Typography";
import ClockIcon from "@/src/components/icons/ClockIcon";
import { capitalizeFirstLetter } from "@/src/utils/common";
import { getColor } from "@/src/constants/colors";
import { AttendanceStatus } from "@/src/types";
import { getStatusColor } from "@/src/utils/attendanceUtils";

interface AttendanceTableProps {
    attendees: AttendanceStatus[];
    getAttendanceStatus: (userId: string) => string;
    isLoading?: boolean;
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({
    attendees,
    getAttendanceStatus,
    isLoading = false,
}) => {
    const getStatusIcon = (status: string) => {
        const color = getStatusColor(status).text;
        return <ClockIcon size={12} color={color} />;
    };

    if (isLoading) {
        return (
            <View style={styles.emptyContainer}>
                <ActivityIndicator size="small" color={getColor("blue", 400)} />
                <Typography variant="b4" color={getColor("dark", 300)}>
                    Loading attendance...
                </Typography>
            </View>
        );
    }

    if (attendees.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Typography variant="b4" color={getColor("dark", 300)}>
                    No attendees found
                </Typography>
            </View>
        );
    }

    return (
        <View style={styles.tableContainer}>
            {/* Table Header */}
            <View style={[styles.tableRow, styles.tableHeader]}>
                <Typography variant="h6" style={[styles.tableCell, styles.headerCell, { flex: 1 }]}>
                    Name
                </Typography>
                <Typography variant="h6" style={[styles.tableCell, styles.headerCell, { flex: 0.5 }]}>
                    Status
                </Typography>
            </View>

            {/* Table Rows */}
            {attendees.map((attendee, index) => {
                const status = getAttendanceStatus(attendee.userId);
                const statusColors = getStatusColor(status);

                return (
                    <View
                        key={attendee.userId}
                        style={[
                            styles.tableRow,
                            index % 2 === 0 ? styles.evenRow : styles.oddRow,
                        ]}
                    >
                        <Typography variant="b4" style={styles.tableCell}>
                            {capitalizeFirstLetter(attendee.fullname)}
                        </Typography>
                        <View style={[styles.tableCell, styles.statusCell, , { flex: 0.5 }]}>
                            <View
                                style={[
                                    styles.statusBadge,
                                    { backgroundColor: statusColors.bg },
                                ]}
                            >
                                {getStatusIcon(status)}
                                <Typography variant="b5" color={statusColors.text}>
                                    {capitalizeFirstLetter(status)}
                                </Typography>
                            </View>
                        </View>
                    </View>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    // Attendance Table Styles
    tableContainer: {
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: getColor("green", 200),
    },
    tableRow: {
        flexDirection: 'row',
        minHeight: 48,
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    tableHeader: {
        backgroundColor: getColor("green", 50),
        borderBottomWidth: 1,
        borderBottomColor: getColor("green", 200),
    },
    tableCell: {
        flex: 1,
        textAlign: 'left',
    },
    headerCell: {
        fontWeight: '600',
        color: getColor("green", 700),
    },
    evenRow: {
        backgroundColor: getColor("light", 400),
    },
    oddRow: {
        backgroundColor: getColor("light", 500),
    },
    statusCell: {
        alignItems: 'flex-start',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
});