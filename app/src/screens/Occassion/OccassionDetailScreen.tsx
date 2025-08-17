import React, { useMemo } from "react";
import { View, StyleSheet, Dimensions, ScrollView } from "react-native";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
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
// import PeopleIcon from "@/src/components/icons/PeopleIcon";
import { RootState } from "@/src/redux/store";
import { formatDateAgo, formatTimeLeft } from "@/src/utils/common";
import StarRating from "@/src/components/ui/StarRating";
import { Event } from '../../types/index';
import { useParams } from "@/src/hooks/useParams";
import StarIcon from "@/src/components/icons/FilledStarIcon";
import TrendingIcon from "@/src/components/icons/TrendingIcon";

const { width } = Dimensions.get('window');

const OccassionDetailScreen = () => {
    const { data } = useParams("OccasionDetail", "data")
    const showAnalytics = true;
    const { users } = useSelector((state: RootState) => state.users);
    const { groups } = useSelector((state: RootState) => state.party);

    // Calculate analytics
    const analytics = useMemo(() => {
        if (!data?.events || !Array.isArray(data.events)) return null;

        const totalUsers = users?.length || 0;
        const attendees = data.attendees?.length || 0;
        
        const attendanceRate = totalUsers > 0 ? (attendees / totalUsers) * 100 : 0;

        // Calculate overall rating from all events
        let totalRatings = 0;
        let ratingCount = 0;
        let eventRatings: { [key: string]: { average: number, count: number } } = {};

        data.events.forEach((event: Event, index: number) => {
            if (event.rating && Array.isArray(event.rating)) {
                const ratings = event.rating.filter(r => r.score > 0);
                if (ratings.length > 0) {
                    const sum = ratings.reduce((acc, r) => acc + r.score, 0);
                    const average = sum / ratings.length;
                    
                    eventRatings[`event_${index}`] = {
                        average: average,
                        count: ratings.length
                    };
                    
                    totalRatings += sum;
                    ratingCount += ratings.length;
                }
            }
        });

        const overallRating = ratingCount > 0 ? totalRatings / ratingCount : 0;
        const participationRate = attendees > 0 && ratingCount > 0 ? (ratingCount / attendees) * 100 : 0;

        return {
            attendanceRate: Math.round(attendanceRate),
            overallRating: Math.round(overallRating * 10) / 10,
            totalRatings: ratingCount,
            participationRate: Math.round(participationRate),
            eventRatings,
            totalAttendees: attendees,
            totalUsers
        };
    }, [data, users]);

    const creator = useMemo(() => 
        users?.find(user => user._id === data?.created_by), 
        [users, data]
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return getColor("yellow", 500);
            case 'started': return getColor("blue", 500);
            case 'ended': return getColor("green", 500);
            default: return getColor("dark", 100);
        }
    };

    const getStatusColorText = (status: string) => {
        switch (status) {
            case 'pending': return "yellow";
            case 'started': return "blue";
            case 'ended': return "green";
            default: return "green";
        }
    };

    const getStatusText = () => {
        if (data?.status === "pending") return formatTimeLeft(data.start_at);
        if (data?.status === 'ended') return formatDateAgo(data.start_at);
        return data?.status;
    };

    const renderAnalyticsCard = () => {
        if (!showAnalytics || !analytics) return null;

        return (
            <View style={styles.analyticsSection}>

                <View style={styles.analyticsGrid}>

                    {/* Attendance Rate */}
                    <View style={[styles.analyticsCard, styles.attendanceCard]}>
                        <View style={styles.analyticsIcon}>
                            <UserIcon size={24} color={getColor("blue", 500)} />
                        </View>
                        <Typography variant="h2" color={getColor("blue", 600)}>
                            {analytics.attendanceRate}%
                        </Typography>
                        <Typography variant="b4" color={getColor("dark", 600)}>
                            Attendance Rate
                        </Typography>
                        <View style={styles.progressBar}>
                            <View 
                                style={[
                                    styles.progressFill, 
                                    { 
                                        width: `${analytics.attendanceRate}%`,
                                        backgroundColor: getColor("blue", 500)
                                    }
                                ]} 
                            />
                        </View>
                        <Typography variant="b5" color={getColor("dark", 500)}>
                            {analytics.totalAttendees} of {analytics.totalUsers} users
                        </Typography>
                    </View>

                </View>
            </View>
        );
    };

    const renderEventCard = (event: Event, index: number) => {
        const group = groups?.find(g => g._id === event.party);
        const eventRating = analytics?.eventRatings[`event_${index}`];

        return (
            <View key={index} style={styles.eventCard}>
                <View style={styles.eventHeader}>
                    <View style={styles.eventTitleRow}>
                        <MisqaatIcon size={18} color={getColor("green", 500)} />
                        <Typography variant="h6" color={getColor("green", 600)}>
                            {event.type || 'Kalam'}
                        </Typography>
                        {eventRating && (
                            <View style={styles.eventRating}>
                                <StarIcon size={14} color={getColor("yellow", 500)} />
                                <Typography variant="b5" color={getColor("yellow", 600)}>
                                    {eventRating.average.toFixed(1)}
                                </Typography>
                            </View>
                        )}
                    </View>
                    <Typography variant="h5" style={styles.eventName}>
                        {event.name || 'Untitled'}
                    </Typography>
                </View>
                
                <View style={styles.eventDetails}>
                    <View style={styles.eventDetailRow}>
                        <GroupIcon size={16} color={getColor("dark", 500)} />
                        <Typography variant="b4" color={getColor("dark", 700)}>
                            {group?.name || 'Unknown Group'}
                        </Typography>
                    </View>
                    {eventRating && (
                        <View style={styles.eventDetailRow}>
                            <LyricsIcon size={16} color={getColor("dark", 500)} />
                            <Typography variant="b4" color={getColor("dark", 700)}>
                                {eventRating.count} feedback{eventRating.count !== 1 ? 's' : ''}
                            </Typography>
                        </View>
                    )}
                </View>
            </View>
        );
    };

    if (!data) return null;

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Hero Section */}
            <View style={styles.heroSection}>
                <View style={styles.heroOverlay}>
                    <View style={styles.heroContent}>
                        <Typography variant="h3" color={getColor("green", 700)} style={styles.heroTitle}>
                            {data.name}
                        </Typography>
                        <Typography variant="b3" style={styles.heroDescription} color={getColor("green", 600)}>
                            {data.description}
                        </Typography>
                        
                        <View style={styles.statusBadge}>
                            <View 
                                style={[
                                    styles.statusDot, 
                                    { backgroundColor: getStatusColor(data.status) }
                                ]} 
                            />
                            <Typography variant="b4" color={getColor("dark", 100)}>
                                {getStatusText()}
                            </Typography>
                        </View>
                    </View>
                </View>
            </View>

            {/* Quick Info Cards */}
            <View style={styles.quickInfoSection}>
                <View style={styles.quickInfoGrid}>
                    <View style={styles.quickInfoCard}>
                        <Calendar12Icon size={20} color={getColor("blue", 500)} />
                        <Typography variant="b5" color={getColor("dark", 600)}>Date</Typography>
                        <Typography variant="b4" color={getColor("dark")}>
                            {dayjs(data.start_at).format("MMM DD, YYYY")}
                        </Typography>
                    </View>
                    
                    <View style={styles.quickInfoCard}>
                        <ClockIcon size={20} color={getColor("blue", 500)} />
                        <Typography variant="b5" color={getColor("dark", 600)}>Time</Typography>
                        <Typography variant="b4" color={getColor("dark")}>
                            {dayjs(data.start_at).format("hh:mm A")}
                        </Typography>
                    </View>
                    
                    <View style={styles.quickInfoCard}>
                        <LocationIcon size={20} color={getColor("red", 500)} />
                        <Typography variant="b5" color={getColor("dark", 600)}>Location</Typography>
                        <Typography variant="b4" color={getColor("dark")}>
                            {data.location}
                        </Typography>
                    </View>
                    
                    <View style={styles.quickInfoCard}>
                        <UserIcon size={20} color={getColor("green", 500)} />
                        <Typography variant="b5" color={getColor("dark", 600)}>Created By</Typography>
                        <Typography variant="b4" color={getColor("dark")}>
                            {creator?.fullname || 'Unknown'}
                        </Typography>
                    </View>
                </View>
            </View>

            {/* Analytics Section */}
            {renderAnalyticsCard()}

            {/* Events Section */}
            <View style={styles.eventsSection}>
                <Typography variant="h4" style={{marginBottom: 8}} color={getColor("green", 700)}>
                    🎵 Kalams
                </Typography>
                {data.events && data.events.length > 0 ? (
                    data.events.map((event: Event, index: number) => 
                        renderEventCard(event, index)
                    )
                ) : (
                    <View style={styles.emptyState}>
                        <MisqaatIcon size={48} color={getColor("dark", 400)} />
                        <Typography variant="b3" color={getColor("dark", 500)}>
                            No events scheduled yet
                        </Typography>
                    </View>
                )}
            </View>

            {/* Additional Details */}
            <View style={styles.detailsSection}>
                <Typography variant="h4" style={{marginBottom: 8}} color={getColor("green", 700)}>
                    📋 Additional Details
                </Typography>
                <View style={styles.detailsCard}>
                    <View style={styles.detailRow}>
                        <Typography variant="b4" color={getColor("dark", 600)}>Created Date:</Typography>
                        <Typography variant="b4" color={getColor("dark")}>
                            {dayjs(data.createdat).format("MMMM DD, YYYY")}
                        </Typography>
                    </View>
                    <View style={styles.detailRow}>
                        <Typography variant="b4" color={getColor("dark", 600)}>Status:</Typography>
                        <Tag color={getStatusColorText(data.status)}>{data.status}</Tag>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: getColor("light", 100),
    },
    
    // Hero Section
    heroSection: {
        height: 200,
        // backgroundColor: getColor("green", 500),
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        overflow: 'hidden',
        position: 'relative',
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        // backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'flex-end',
        padding: 20,
    },
    heroContent: {
        marginBottom: 10,
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    heroDescription: {
        fontSize: 16,
        marginBottom: 16,
        lineHeight: 22,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: getColor("green", 100, 0.6),
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        alignSelf: 'flex-start',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    
    // Quick Info Section
    quickInfoSection: {
        padding: 16,
        marginTop: -20,
    },
    quickInfoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    quickInfoCard: {
        backgroundColor: getColor("light"),
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        flex: 1,
        minWidth: (width - 60) / 2,
        shadowColor: getColor("dark"),
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        gap: 6,
    },
    
    // Analytics Section
    analyticsSection: {
        padding: 16,
    },
    analyticsGrid: {
        gap: 16,
    },
    analyticsCard: {
        backgroundColor: getColor("light"),
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: getColor("dark"),
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    ratingCard: {
        borderLeftWidth: 4,
        borderLeftColor: getColor("yellow", 500),
    },
    attendanceCard: {
        borderLeftWidth: 4,
        borderLeftColor: getColor("blue", 500),
    },
    participationCard: {
        borderLeftWidth: 4,
        borderLeftColor: getColor("green", 500),
    },
    analyticsIcon: {
        backgroundColor: getColor("dark", 100),
        padding: 12,
        borderRadius: 50,
        marginBottom: 12,
    },
    progressBar: {
        width: '100%',
        height: 6,
        backgroundColor: getColor("dark", 200),
        borderRadius: 3,
        marginTop: 8,
        marginBottom: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    
    // Events Section
    eventsSection: {
        padding: 16,
    },
    eventCard: {
        backgroundColor: getColor("light"),
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: getColor("dark"),
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    eventHeader: {
        marginBottom: 12,
    },
    eventTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    eventRating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginLeft: 'auto',
        backgroundColor: getColor("yellow", 100),
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    eventName: {
        fontSize: 18,
        fontWeight: '600',
        color: getColor("dark"),
    },
    eventDetails: {
        gap: 8,
    },
    eventDetailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    
    // Details Section
    detailsSection: {
        padding: 16,
        paddingBottom: 32,
    },
    detailsCard: {
        backgroundColor: getColor("light"),
        padding: 16,
        borderRadius: 12,
        gap: 12,
        shadowColor: getColor("dark"),
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    
    // Empty State
    emptyState: {
        alignItems: 'center',
        padding: 40,
        gap: 12,
    },
});

export default OccassionDetailScreen;