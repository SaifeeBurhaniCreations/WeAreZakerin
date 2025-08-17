import React from "react";
import { Modal, View, TouchableOpacity, StyleSheet } from "react-native";
import { ScrollView } from "moti";
import Typography from "@/src/components/typography/Typography";
import Button from "@/src/components/ui/Button";
import CrossIcon from "@/src/components/icons/CrossIcon";
import { capitalizeFirstLetter } from "@/src/utils/common";
import { AttendanceStatus } from "@/src/types";
import { getColor } from "@/src/constants/colors";
import { getStatusColor } from "@/src/utils/attendanceUtils";

interface AttendanceModalProps {
    visible: boolean;
    onClose: () => void;
    attendees: AttendanceStatus[];
    getAttendanceStatus: (userId: string) => string;
    updateAttendance: (userId: string, status: "present" | "absent") => void;
}

export const AttendanceModal: React.FC<AttendanceModalProps> = ({
    visible,
    onClose,
    attendees,
    getAttendanceStatus,
    updateAttendance,
}) => {
    return (
        <Modal
            transparent
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.attendanceModalContent}>
                    <View style={styles.modalHeader}>
                        <Typography variant="h5" color={getColor("green", 700)}>
                            Mark Attendance
                        </Typography>
                        <TouchableOpacity onPress={onClose}>
                            <CrossIcon size={24} color={getColor("dark", 400)} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
                        {attendees.map((attendee) => {
                            const status = getAttendanceStatus(attendee.userId);

                            return (
                                <View key={attendee.userId} style={styles.memberRow}>
                                    <View style={styles.memberInfo}>
                                        <Typography variant="b3">
                                            {capitalizeFirstLetter(attendee.fullname)}
                                        </Typography>
                                    </View>

                                    <View style={styles.statusButtons}>
                                        {["present", "absent"].map((statusOption) => {
                                            const isSelected = status === statusOption;
                                            const statusColors = getStatusColor(statusOption);

                                            return (
                                                <TouchableOpacity
                                                    key={statusOption}
                                                    style={[
                                                        styles.statusButton,
                                                        isSelected && {
                                                            backgroundColor: statusColors.bg,
                                                            borderColor: statusColors.text,
                                                            borderWidth: 2,
                                                        },
                                                    ]}
                                                    onPress={() =>
                                                        updateAttendance(
                                                            attendee.userId,
                                                            statusOption as "present" | "absent"
                                                        )
                                                    }
                                                >
                                                    <Typography
                                                        variant="b5"
                                                        color={
                                                            isSelected
                                                                ? statusColors.text
                                                                : getColor("dark", 400)
                                                        }
                                                        style={{
                                                            fontWeight: isSelected ? "600" : "400",
                                                        }}
                                                    >
                                                        {capitalizeFirstLetter(statusOption)}
                                                    </Typography>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </View>
                            );
                        })}
                    </ScrollView>

                    <View style={styles.modalActions}>
                        <Button size="md" variant="outline" onPress={onClose} style={{ flex: 1 }}>
                            Close
                        </Button>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    pageContainer: {
        flexGrow: 1,
        padding: 16,
        gap: 16,
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    card: {
        backgroundColor: getColor("light", 500),
        padding: 12,
        borderRadius: 12,
        gap: 8,
        shadowColor: getColor("dark", 400),
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 2,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: 'space-between',
    },
    locationRow: {
        flexDirection: "row",
        gap: 4,
        alignItems: "center",
        justifyContent: 'flex-end'
    },
    horizontalCards: {
        flexDirection: "row",
        gap: 16,
        marginVertical: 8,
    },
    infoRowWrapper: {
        gap: 4,
        flexDirection: "column",
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingVertical: 2,
    },
    Vstack: {
        flexDirection: "column",
        gap: 4,
    },
    Hstack: {
        flexDirection: "row",
        gap: 4,
    },
    borderBottom: {
        borderBottomWidth: 1,
        borderBottomColor: getColor("green", 700, 0.15),
        paddingBottom: 12,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: getColor('light'),
        padding: 20,
        borderRadius: 12,
        width: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
        gap: 8,
    },
    feedbackLayout: {
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: 'space-between',
        width: '100%'
    },

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
    attendanceStats: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    attendanceActions: {
        alignItems: 'flex-end',
        marginTop: 12,
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Attendance Modal Styles
    attendanceModalContent: {
        backgroundColor: getColor('light'),
        borderRadius: 12,
        width: '90%',
        maxHeight: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: getColor("green", 200),
    },
    modalScrollView: {
        maxHeight: 400,
        padding: 16,
    },
    memberRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: getColor("light", 300),
    },
    memberInfo: {
        flex: 1,
        gap: 4,
    },
    statusButtons: {
        flexDirection: 'row',
        gap: 4,
    },
    statusButton: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: getColor("light", 300),
        backgroundColor: getColor("light", 200),
        minWidth: 50,
        alignItems: 'center',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: getColor("green", 200),
        gap: 12,
    },
});