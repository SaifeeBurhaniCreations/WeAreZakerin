import React, { useEffect, useState, useMemo, Fragment } from "react";
import { ActivityIndicator, Modal, View, TouchableOpacity } from "react-native";
import { ScrollView } from "moti";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { useParams } from "@/src/hooks/useParams";
import { getColor } from "@/src/constants/colors";
import Typography from "@/src/components/typography/Typography";
import Tag from "@/src/components/ui/Tag";
import Calendar12Icon from "@/src/components/icons/Calendar12Icon";
import ClockIcon from "@/src/components/icons/ClockIcon";
import LocationIcon from "@/src/components/icons/LocationIcon";
import UserIcon from "@/src/components/icons/UserIcon";
import Button from "@/src/components/ui/Button";
import { RootState } from "@/src/redux/store";
import { capitalizeFirstLetter, formatDateAgo, formatTimeLeft } from "@/src/utils/common";
import Overlay from "@/src/components/ui/Overlay";
import { useDeleteOccasion, useUpdateOccassion } from "@/src/hooks/useOccassion";
import { Toast } from "@/src/utils/Toast";
import useAppNavigation from "@/src/hooks/useAppNavigation";
import InfoRow from "@/src/components/ui/InfoRow";
import InformationIcon from "@/src/components/icons/InformationIcon";
import { buildAttendeesFromUsers, prepareUpdatePayload } from "@/src/utils/attendanceUtils";
import { useAttendance } from "@/src/hooks/useAttendance";
import { useRatings } from "@/src/hooks/useRatings";
import { AttendanceTable } from "@/src/components/ui/AttendanceTable";
import { EventRatingCard } from "@/src/components/ui/EventRatingCard";
import { AttendanceModal } from "@/src/components/ui/AttendanceModal";
import { StyleSheet } from "react-native";
import { Occassion } from "@/src/redux/slices/OccassionSlice";



const OccasionAttendanceScreen = () => {
    const { data } = useParams("ManageOccasion", "data");
    const { users, me } = useSelector((state: RootState) => state.users);
    const { groups } = useSelector((state: RootState) => state.party);
    const { deleteOccasion, isLoading: isDeleting } = useDeleteOccasion();
    const { updateOccassion, isLoading: isUpdating } = useUpdateOccassion();
    const { goTo } = useAppNavigation();

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showAttendanceModal, setShowAttendanceModal] = useState(false);

    const currentUserId = me?._id;

    // Memoized values
    const creator = useMemo(
        () => users?.find((val) => val._id === data?.created_by),
        [users, data?.created_by]
    );

    const myAdminGroupIds = useMemo(() => {
        if (!me || !groups) return [];
        const adminGroup = groups.find((g) => g.admin === currentUserId);
        return adminGroup?.members || [];
    }, [me, groups, currentUserId]);

    // const isStarted = true
    const isStarted = useMemo(
        () => data?.start_at ? new Date(data.start_at).getTime() <= Date.now() : false,
        [data?.start_at]
    );

    // Initialize attendees
    const initialAttendees = useMemo(() => {
        if (!users || !data) return [];
        return buildAttendeesFromUsers(users, data.attendees || [], myAdminGroupIds);
    }, [users, data?.attendees, myAdminGroupIds]);

    // Custom hooks
    const {
        attendees,
        setAttendees,
        updateAttendance,
        getAttendanceStatus,
        attendanceStats,
    } = useAttendance(initialAttendees);

    const { events, getUserRating, updateUserRating } = useRatings(
        data?.events || [],
        currentUserId
    );

    // Update attendees when initial data changes
    useEffect(() => {
        setAttendees(initialAttendees);
    }, [initialAttendees, setAttendees]);

    // Event handlers
    const handleDeleteOccasion = async () => {
        if (!data?._id) return;
        
        try {
            const response = await deleteOccasion(data._id);
            if (response?.success) {
                setShowDeleteModal(false);
                goTo("Home");
                Toast.show({
                    title: "Miqaat Deleted",
                    description: "Miqaat deleted successfully.",
                    variant: "success",
                });
            }
        } catch (error) {
            Toast.show({
                title: "Delete Failed",
                description: "Failed to delete Miqaat. Please try again.",
                variant: "error",
            });
        }
    };

    const handleUpdateOccasion = async () => {
        if (!data?._id) return;

        try {
            const updatePayload = prepareUpdatePayload(events, attendees);
            const response = await updateOccassion(data._id, updatePayload);
            
            if (response?.success) {
                Toast.show({
                    title: "Miqaat Updated",
                    description: "Ratings and attendance saved successfully.",
                    variant: "success",
                });
            }
        } catch (error) {
            Toast.show({
                title: "Update Failed",
                description: "Failed to update Miqaat. Please try again.",
                variant: "error",
            });
        }
    };

    // Loading state
    if (!data) {
        return (
            <View style={[styles.pageContainer, styles.centered]}>
                <ActivityIndicator size="large" color={getColor("blue", 400)} />
                <Typography variant="h6" style={{ marginTop: 16 }}>
                    Loading Occasion...
                </Typography>
            </View>
        );
    }

    return (
        <Fragment>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.pageContainer}>
                    {/* Header */}
                    <View style={styles.card}>
                        <View style={styles.headerRow}>
                            <Typography variant="h4" style={{ flexShrink: 1, flex: 0.8 }}>
                                {data.name}
                            </Typography>
                            {data.status === "pending" ? (
                                <Typography color={getColor("red")} variant="b4">
                                    {formatTimeLeft(data.start_at)}
                                </Typography>
                            ) : data.status === "ended" ? (
                                <Typography color={getColor("green")} variant="b4">
                                    {formatDateAgo(data.start_at)}
                                </Typography>
                            ) : (
                                <Tag>{data.status}</Tag>
                            )}
                        </View>
                        <Typography variant="b4">{data.description}</Typography>
                        <View style={styles.locationRow}>
                            <LocationIcon size={16} color={getColor("green", 400)} />
                            <Typography variant="h6" color={getColor("green", 400)}>
                                {data.location}
                            </Typography>
                        </View>
                    </View>

                    {/* Info cards */}
                    <View style={styles.horizontalCards}>
                        <View style={[styles.card, { flex: 0.5 }]}>
                            <InfoRow
                                icon={Calendar12Icon}
                                label="Miqaat Date :-"
                                value={dayjs(data.start_at).format("MMMM Do YYYY")}
                            />
                            <InfoRow
                                icon={ClockIcon}
                                label="Miqaat Time :-"
                                value={dayjs(data.start_at).format("hh:mm A")}
                            />
                        </View>
                        <View style={[styles.card, { flex: 0.5 }]}>
                            <InfoRow
                                icon={UserIcon}
                                label="Created by :-"
                                value={creator?.fullname}
                            />
                            <InfoRow
                                icon={Calendar12Icon}
                                label="Created at :-"
                                value={dayjs(data.createdat).format("MMMM Do YYYY")}
                            />
                        </View>
                    </View>

                    {/* Attendance Stats */}
                    <View style={styles.statsCard}>
                        <Typography variant="h6" color={getColor("green", 700)}>
                            Attendance: {attendanceStats.present}/{attendanceStats.total} ({attendanceStats.percentage.toFixed(1)}%)
                        </Typography>
                    </View>

                    {/* Attendees Section */}
                    <View style={styles.headerRow}>
                        <Typography variant="h4">Attendees</Typography>
                        <Button disabled={!isStarted} size="sm" variant="fill" onPress={() => setShowAttendanceModal(true)}>
                            <Typography variant="b4" color={getColor("light")} >Mark Attendance</Typography>
                        </Button>
                    </View>

                    <View style={[styles.card, { padding: 0 }]}>
                        <AttendanceTable
                            attendees={attendees}
                            getAttendanceStatus={getAttendanceStatus}
                        />
                    </View>

                    {/* Feedback Section */}
                    <View style={styles.headerRow}>
                        <Typography variant="h4">Feedback</Typography>
                        {!isStarted && (
                            <View style={styles.Hstack}>
                                <InformationIcon color={getColor("blue")} />
                                <Typography variant="b4" color={getColor("blue")}>
                                    Rating unlocks when event starts!
                                </Typography>
                            </View>
                        )}
                    </View>

                    {events.length === 0 ? (
                        <Typography variant="b4" color={getColor("dark", 300)}>
                            No kalams assigned
                        </Typography>
                    ) : (
                        events.map((event, idx) => (
                            <EventRatingCard
                                key={event._id}
                                event={event}
                                index={idx}
                                partyName={groups?.find((g) => g._id === event.party)?.name}
                                userRating={getUserRating(event)}
                                isStarted={isStarted}
                                onRatingChange={updateUserRating}
                            />
                        ))
                    )}

                    {/* Save Button */}
                    <View style={styles.saveButtonContainer}>
                        <Button
                            size="md"
                            onPress={handleUpdateOccasion}
                            disabled={isUpdating || !isStarted}
                            style={{ flex: 0.8 }}
                        >
                            {isUpdating ? "Saving..." : "Save Ratings & Attendance"}
                        </Button>
                    </View>
                </View>
            </ScrollView>

            {/* Delete Modal */}
            <Modal
                transparent
                visible={showDeleteModal}
                animationType="fade"
                onRequestClose={() => setShowDeleteModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Typography variant="h5" color={getColor("green", 700)}>
                            Confirm Delete
                        </Typography>
                        <Typography variant="b4" color={getColor("green", 400)}>
                            Are you sure you want to delete this Miqaat?
                        </Typography>
                        <View style={styles.modalActions}>
                            <Button
                                size="sm"
                                variant="outline"
                                onPress={() => setShowDeleteModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                color="red"
                                onPress={handleDeleteOccasion}
                                disabled={isDeleting}
                            >
                                {isDeleting ? "Deleting..." : "Delete"}
                            </Button>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Attendance Modal */}
            <AttendanceModal
                visible={showAttendanceModal}
                onClose={() => setShowAttendanceModal(false)}
                attendees={attendees}
                getAttendanceStatus={getAttendanceStatus}
                updateAttendance={updateAttendance}
            />

            <Overlay />
        </Fragment>
    );
};

export default OccasionAttendanceScreen;

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
        justifyContent: "space-between",
    },
    locationRow: {
        flexDirection: "row",
        gap: 4,
        alignItems: "center",
        justifyContent: "flex-end",
    },
    horizontalCards: {
        flexDirection: "row",
        gap: 16,
        marginVertical: 8,
    },
    statsCard: {
        backgroundColor: getColor("green", 100),
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: getColor("green", 400),
    },
    Vstack: {
        flexDirection: "column",
        gap: 4,
    },
    Hstack: {
        flexDirection: "row",
        gap: 4,
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
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 16,
        gap: 8,
    },
    saveButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
});