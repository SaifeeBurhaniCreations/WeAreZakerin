import { Image, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs';
import { renderHexagonRow } from '@/src/utils/hexagonUtils';
import { getColor } from '@/src/constants/colors';
import Typography from '../typography/Typography';
import commonBanner from "@/src/assets/images/ashara-hd.png";
import Carousel from 'react-native-reanimated-carousel';
import { usePendingOccasions } from '@/src/hooks/useOccassion';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/redux/store';
import Button from './Button';
import useAppNavigation from '@/src/hooks/useAppNavigation';
import Tag from './Tag';
import { formatDateAgo, formatTimeLeft } from '@/src/utils/common';

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window');

// Responsive banner height based on device size
const getBannerHeight = () => {
    if (DEVICE_HEIGHT < 700) return 180; // Small phones
    if (DEVICE_HEIGHT < 800) return 200; // Medium phones  
    return 220; // Large phones/tablets
};

const BANNER_HEIGHT = getBannerHeight();

// Responsive padding and margins
const getResponsivePadding = () => {
    return DEVICE_WIDTH < 360 ? 12 : 16;
};

const BannerCarousel = ({ SCREEN_WIDTH }: { SCREEN_WIDTH: number }) => {
    const [occasions, setOccasions] = useState<any[]>([]);
    const { data, isLoading } = usePendingOccasions(['pending', 'started']);
    const { groups } = useSelector((state: RootState) => state.party)

    const { goTo } = useAppNavigation();

    useMemo(() => {
        if (!isLoading && data) {
            setOccasions(data)            
        }
    }, [isLoading, data])

    const slides = useMemo(() => {
        let arr: any[] = [];
        arr.push({ type: "banner" });
        if (occasions.length > 0) {
            arr = arr.concat(
                occasions.map((o) => ({
                    type: "occasion",
                    data: o,
                }))
            );
        }
        return arr;
    }, [occasions]);

    const renderOccasionCard = (item: any) => {
        const responsivePadding = getResponsivePadding();
        
        return (
            <TouchableOpacity 
                onPress={() => goTo("ManageOccasion", { data: item })} 
                style={[styles.card, { padding: responsivePadding }]}
                activeOpacity={0.8}
            >
                <View style={styles.hexagonBackground}>
                    {Array.from({ length: 18 }, (_, index) => 
                        renderHexagonRow(index, SCREEN_WIDTH, getColor("green", 500, 0.5))
                    )}
                </View>
                
                <View style={styles.cardContent}>
                    <View style={styles.cardHeaderLayout}>
                        <View style={styles.cardHeaderContent}>
                            <Typography 
                                variant="h3" 
                                numberOfLines={2}
                                ellipsizeMode="tail"
                                style={styles.cardTitle}
                            >
                                {item.name}
                            </Typography>
                            <Typography 
                                color={getColor("green", 700)} 
                                variant="b4"
                                numberOfLines={1}
                                ellipsizeMode="tail"
                                style={styles.cardDate}
                            >
                                {dayjs(item.start_at).format("MMMM Do YYYY")} at {dayjs(item.start_at).format("hh:mm A")}
                            </Typography>
                        </View>
                        
                        <View style={styles.cardActions}>
                            {item.status === "pending" ? (
                                <Typography 
                                    color={getColor("red")} 
                                    variant="b4"
                                    numberOfLines={1}
                                    style={styles.statusText}
                                >
                                    {formatTimeLeft(item.start_at)}
                                </Typography>
                            ) : (
                                <Typography 
                                    color={getColor("blue")} 
                                    variant="b4"
                                    numberOfLines={1}
                                    style={[styles.statusText, styles.statusActive]}
                                >
                                    {item.status}
                                </Typography>
                            )}
                            <Button 
                                onPress={() => goTo("OccasionAttendance", { data: item })} 
                                variant='fill' 
                                style={styles.attendanceButton} 
                                color="blue" 
                                size='sm'
                            >
                                Attendance
                            </Button>
                        </View>
                    </View>
                    
                    <View style={styles.eventsContainer}>
                        {item.events.slice(0, 3).map((ev: any, idx: number) => {
                            const group = groups?.find(val => val._id === ev.party)
                            return (
                                <Text key={idx} style={styles.eventChip} numberOfLines={1}>
                                    {ev.type} → {group?.name || 'Unknown'}
                                </Text>
                            )
                        })}
                        {item.events.length > 3 && (
                            <Text style={[styles.eventChip, styles.moreEventsChip]}>
                                +{item.events.length - 3} more
                            </Text>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.carouselWrap}>
            <Carousel
                width={SCREEN_WIDTH}
                height={BANNER_HEIGHT}
                data={slides}
                loop
                pagingEnabled
                snapEnabled
                autoPlay
                autoPlayInterval={4000}
                scrollAnimationDuration={700}
                renderItem={({ item, index }) => {
                    if (item.type === "banner") {
                        return (
                            <View style={styles.slide}>
                                <Image 
                                    source={commonBanner} 
                                    resizeMode="cover" 
                                    style={styles.banner} 
                                />
                            </View>
                        );
                    }
                    const o = item.data;
                    return (
                        <View style={styles.slide}>
                            {renderOccasionCard(o)}
                        </View>
                    );
                }}
            />
        </View>
    );
}

export default BannerCarousel

const styles = StyleSheet.create({
    carouselWrap: {
        width: "100%",
        height: BANNER_HEIGHT,
        borderRadius: 0,
        overflow: "hidden",
    },
    
    slide: {
        width: "100%",
        height: "100%",
    },
    
    banner: { 
        width: "100%", 
        height: BANNER_HEIGHT,
        resizeMode: 'cover',
    },
    
    card: {
        backgroundColor: "#fff",
        borderRadius: 0,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 4.65,
        elevation: 6,
        height: BANNER_HEIGHT,
        position: 'relative',
        justifyContent: 'space-between',
    },
    
    hexagonBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 0,
    },
    
    cardContent: {
        flex: 1,
        zIndex: 1,
        justifyContent: 'space-between',
    },
    
    cardHeaderLayout: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingBottom: DEVICE_WIDTH < 360 ? 8 : 12,
        borderBottomWidth: 1,
        borderBottomColor: getColor("green", 700, 0.2),
        minHeight: DEVICE_HEIGHT < 700 ? 60 : 70,
    },
    
    cardHeaderContent: {
        flex: 1,
        paddingRight: 12,
        justifyContent: 'flex-start',
    },
    
    cardTitle: {
        marginBottom: 4,
        flexShrink: 1,
    },
    
    cardDate: {
        flexShrink: 1,
    },
    
    cardActions: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        minWidth: DEVICE_WIDTH < 360 ? 80 : 100,
        maxWidth: DEVICE_WIDTH < 360 ? 100 : 120,
    },
    
    statusText: {
        textAlign: 'right',
        marginBottom: 6,
    },
    
    statusActive: {
        textTransform: 'capitalize',
    },
    
    attendanceButton: {
        marginTop: 4,
        paddingHorizontal: DEVICE_WIDTH < 360 ? 8 : 12,
        paddingVertical: DEVICE_WIDTH < 360 ? 4 : 6,
        minWidth: DEVICE_WIDTH < 360 ? 70 : 85,
    },
    
    eventsContainer: { 
        marginTop: 8,
        flexDirection: "row", 
        flexWrap: "wrap",
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
    },
    
    eventChip: {
        backgroundColor: getColor("green", 200, 0.5),
        paddingHorizontal: DEVICE_WIDTH < 360 ? 6 : 8,
        paddingVertical: DEVICE_WIDTH < 360 ? 3 : 4,
        borderRadius: 6,
        fontSize: DEVICE_WIDTH < 360 ? 11 : 12,
        color: getColor("green", 700),
        margin: 2,
        maxWidth: '45%',
        textAlign: 'center',
    },
    
    moreEventsChip: {
        backgroundColor: getColor("blue", 200, 0.5),
        color: getColor("blue", 700),
        fontWeight: '600',
    },
})