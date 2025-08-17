import React, { useEffect, useState, useMemo, useCallback, Fragment } from "react";
import { ActivityIndicator, Modal, StyleSheet, View } from "react-native";
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
import GroupIcon from "@/src/components/icons/GroupIcon";
import MisqaatIcon from "@/src/components/icons/MisqaatIcon";
import LyricsIcon from "@/src/components/icons/LyricsIcon";
import Input from "@/src/components/ui/Input";
import Button from "@/src/components/ui/Button";
import { RootState } from "@/src/redux/store";
import Select from "../../components/ui/Select";
import { formatDateAgo, formatTimeLeft, KALAM_OPTIONS } from "@/src/utils/common";
import Overlay from "@/src/components/ui/Overlay";
import { useDeleteOccasion, useUpdateOccassion } from "@/src/hooks/useOccassion";
import { Toast } from "@/src/utils/Toast";
import useAppNavigation from "@/src/hooks/useAppNavigation";
import InfoRow from "@/src/components/ui/InfoRow";
import StarRating from "@/src/components/ui/StarRating";
import InformationIcon from "@/src/components/icons/InformationIcon";
import { Event } from '../../types/index'


const ManageOccassionScreen = () => {
    const { data } = useParams("ManageOccasion", "data");
    const { users } = useSelector((state: RootState) => state.users);
    const { groups } = useSelector((state: RootState) => state.party);
    const { deleteOccasion, isLoading } = useDeleteOccasion();
    const { updateOccassion, isLoading: isUpdating } = useUpdateOccassion();
    const { goTo } = useAppNavigation();

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [events, setEvents] = useState<Event[]>([]);

    const { me } = useSelector((state: RootState) => state.users);
    const currentUserId = me?._id;

    const creator = useMemo(() => users?.find(val => val._id === data?.created_by), [users, data]);

    const groupOptions = useMemo(
        () =>
            groups?.map(group => ({
                label: group.name,
                value: group._id
            })) || [],
        [groups]
    );

    useEffect(() => {
        if (data?.events) {
            // Deep-copy and ensure .rating array
            setEvents(data.events.map(ev => ({
                ...ev,
                rating: Array.isArray(ev.rating) ? ev.rating : [],
            })));
        }
    }, [data]);

    const updateEventField = useCallback(
        (index: number, field: keyof typeof events[0], value: string) => {
            setEvents(prev =>
                prev.map((ev, i) => i === index ? { ...ev, [field]: value } : ev)
            );
        },
        []
    );

    // Helpers for feedback/rating system
    const getUserRating = (event: typeof events[0]) => {
        return event.rating.find(r => r.ratingBy === currentUserId) || { score: 0 };
    };

    const updateUserRating = useCallback(
        (eventIndex: number, newScore: number) => {
            setEvents(prevEvents => {
                const updated = [...prevEvents];
                const event = updated[eventIndex];
                const existingIndex = event.rating.findIndex(r => r.ratingBy === currentUserId);

                if (existingIndex > -1) {
                    event.rating[existingIndex] = { ratingBy: currentUserId!, score: newScore };
                } else {
                    event.rating.push({ ratingBy: currentUserId!, score: newScore });
                }
                return updated;
            });
        },
        [currentUserId]
    );

    if (!data) {
        return (
            <View style={[styles.pageContainer, styles.centered]}>
                <ActivityIndicator size="large" color={getColor("blue", 400)} />
                <Typography variant="h6" style={{ marginTop: 16 }}>Loading Occasion...</Typography>
            </View>
        );
    }

    // const isStarted = false
    const isStarted = useMemo(
        () => new Date(data?.start_at).getTime() > Date.now(),
        [data]
    );

    async function handleDeleteOccassion() {
        if (!data?._id) return;
        const response = await deleteOccasion(data?._id);
        if (response.success) {
            setShowDeleteModal(false);
            goTo("Home");
            Toast.show({
                title: 'Miqaat Deleted',
                description: 'Miqaat Deleted Successfully.',
                variant: 'success',
            });
        }
    }

    async function handleUpdateOccassion() {
        if (!data?._id) return;
        // Save full events array, including ratings per event
        const response = await updateOccassion(data._id, { events });
        if (response.success) {
            Toast.show({
                title: 'Miqaat Updated',
                description: 'Miqaat Updated Successfully.',
                variant: 'success',
            });
        }
    }

    const renderOccasionCard = (ev: Event, idx: number) => {
        const userRating = getUserRating(ev);
        const userScore = userRating?.score || 0;
        return (
            <View key={idx} style={[styles.card, isStarted && { opacity: 0.8 }]}>
                <View style={[styles.Vstack, styles.borderBottom]}>
                    <View style={[styles.infoRow]}>
                        <View style={[styles.infoRowWrapper, { flex: 0.5 }]}>
                            <View style={styles.infoRow}>
                                <MisqaatIcon size={16} color={getColor("green", 400)} />
                                <Typography
                                    variant="h6"
                                    color={getColor("green", 400)}
                                >
                                    Type :-
                                </Typography>
                            </View>
                            <Select
                                options={KALAM_OPTIONS}
                                disabled={isStarted}
                                style={{ flex: 0.8 }}
                                value={ev.type}
                                onSelect={(text: string) => updateEventField(idx, "type", text)}
                                placeholder="Select"
                            />
                        </View>
                        <View style={[styles.infoRowWrapper, { flex: 0.5 }]}>
                            <View style={styles.infoRow}>
                                <GroupIcon size={16} color={getColor("green", 400)} />
                                <Typography
                                    variant="h6"
                                    color={getColor("green", 400)}
                                >
                                    Recited by :-
                                </Typography>
                            </View>
                            <Select
                                options={groupOptions}
                                style={{ flex: 0.8 }}
                                disabled={isStarted}
                                value={ev.party}
                                onSelect={(text: string) => updateEventField(idx, "party", text)}
                                placeholder="Select"
                            />
                        </View>
                    </View>
                    <View style={styles.infoRow}>
                        <LyricsIcon size={16} color={getColor("green", 400)} />
                        <Typography
                            variant="h6"
                            color={getColor("green", 400)}
                        >
                            Name :-
                        </Typography>
                    </View>
                    <Input
                        placeholder={`Enter ${ev.type} name`}
                        disabled={isStarted}
                        value={ev.name || ""}
                        onChangeText={(text: string) => updateEventField(idx, "name", text)}
                    />
                </View>

                {/* Feedback & Rating */}
                <View style={styles.Vstack}>
                    <View style={styles.feedbackLayout}>
                        <Typography variant="b3" color={getColor("yellow")}>Feedback</Typography>
                        <StarRating
                            disabled={isStarted}
                            value={userScore}
                            onChange={(score: number) => updateUserRating(idx, score)}
                        />
                    </View>
                </View>
            </View>
        )
    }

    return (
        <Fragment>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.pageContainer}>
                    {/* Header */}
                    <View style={styles.card}>
                        <View style={styles.headerRow}>
                            <Typography variant="h4" style={{ flexShrink: 1, flex: 0.8 }}>{data.name}</Typography>
                            {data.status === "pending" ? (
                                <Typography color={getColor("red")} variant="b4">{formatTimeLeft(data.start_at)}</Typography>
                            ) : data.status === 'ended' ? (
                                <Typography color={getColor("green")} variant="b4">{formatDateAgo(data.start_at)}</Typography>
                            ) : (
                                <Tag>{data.status}</Tag>
                            )}
                        </View>
                        <Typography variant="b4">{data.description}</Typography>
                        <View style={styles.locationRow}>
                            <LocationIcon size={16} color={getColor("green", 400)} />
                            <Typography variant="h6" color={getColor("green", 400)}>{data.location}</Typography>
                        </View>
                    </View>

                    {/* Info cards */}
                    <View style={styles.horizontalCards}>
                        <View style={[styles.card, { flex: 0.5 }]}>
                            <InfoRow icon={Calendar12Icon} label="Miqaat Date :-" value={dayjs(data.start_at).format("MMMM Do YYYY")} />
                            <InfoRow icon={ClockIcon} label="Miqaat Time :-" value={dayjs(data.start_at).format("hh:mm A")} />
                        </View>
                        <View style={[styles.card, { flex: 0.5 }]}>
                            <InfoRow icon={UserIcon} label="Created by :-" value={creator?.fullname} />
                            <InfoRow icon={Calendar12Icon} label="Created at :-" value={dayjs(data.createdat).format("MMMM Do YYYY")} />
                        </View>
                    </View>

                    {/* Kalam Section */}
                    <View style={styles.headerRow}>
                        <Typography variant="h4">Kalams</Typography>
                        {isStarted && (
                            <View style={styles.Hstack}>
                                <InformationIcon color={getColor("blue")} />
                                <Typography variant="b4" color={getColor('blue')}>Cards unlock when event starts !!</Typography>
                            </View>
                        )}
                    </View>
                    {events.length === 0 ? (
                        <Typography variant="b4" color={getColor("dark", 300)}>
                            No kalams assigned
                        </Typography>
                    ) : (
                        events.map((ev, idx) => renderOccasionCard(ev, idx))
                    )}

                    <View style={[styles.headerRow, { justifyContent: 'center', gap: 8 }]}>
                        <Button size="md" onPress={handleUpdateOccassion} disabled={isStarted || isUpdating} style={{ flex: 0.8 }}>
                            {isUpdating ? 'Saving...' : 'Save'}
                        </Button>
                        <Button onPress={() => setShowDeleteModal(true)} size="md" color="red">Delete</Button>
                    </View>
                </View>
            </ScrollView>
            <Modal
                transparent
                visible={showDeleteModal}
                animationType="fade"
                onRequestClose={() => setShowDeleteModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Typography variant="h5" color={getColor('green', 700)}>Confirm Leave</Typography>
                        <Typography variant="b4" color={getColor('green', 400)}>
                            Are you sure you want to leave ?
                        </Typography>
                        <View style={[styles.headerRow, { justifyContent: 'flex-end', marginTop: 16, gap: 8 }]}>
                            <Button size="sm" variant="outline" onPress={() => setShowDeleteModal(false)}>Cancel</Button>
                            <Button size="sm" color="red" onPress={handleDeleteOccassion}>{isLoading ? 'Deleting...' : 'Delete'}</Button>
                        </View>
                    </View>
                </View>
            </Modal>
            <Overlay />
        </Fragment>
    );
};

export default ManageOccassionScreen;

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
    actionRow: {
        flexDirection: "row",
        justifyContent: "flex-end",
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
    }
});
