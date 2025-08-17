import React from "react";
import { StyleSheet, View } from "react-native";
import Typography from "@/src/components/typography/Typography";
import StarRating from "@/src/components/ui/StarRating";
import GroupIcon from "@/src/components/icons/GroupIcon";
import LyricsIcon from "@/src/components/icons/LyricsIcon";
import { capitalizeFirstLetter } from "@/src/utils/common";
import { getColor } from "@/src/constants/colors";
import { Event, Rating } from "@/src/types";

interface EventRatingCardProps {
    event: Event;
    index: number;
    partyName?: string;
    userRating: Rating;
    isStarted: boolean;
    onRatingChange: (index: number, score: number) => void;
}

export const EventRatingCard: React.FC<EventRatingCardProps> = ({
    event,
    index,
    partyName,
    userRating,
    isStarted,
    onRatingChange,
}) => {
    return (
        <View style={[styles.card, !isStarted && { opacity: 0.8 }]}>
            <View style={[styles.Vstack, styles.borderBottom]}>
                <Typography variant="h4" color={getColor("green", 400)}>
                    {capitalizeFirstLetter(event.type!)}
                </Typography>
                <View style={[styles.infoRowWrapper, { alignItems: "flex-start" }]}>
                    <View style={styles.infoRow}>
                        <GroupIcon size={16} color={getColor("green", 400)} />
                        <Typography variant="h6" color={getColor("green", 400)}>
                            Recited by :-
                        </Typography>
                        <Typography variant="b4" color={getColor("green", 400)}>
                            {capitalizeFirstLetter(partyName || "Unknown")}
                        </Typography>
                    </View>
                    <View style={styles.infoRow}>
                        <LyricsIcon size={16} color={getColor("green", 400)} />
                        <Typography variant="h6" color={getColor("green", 400)}>
                            Name :-
                        </Typography>
                        <Typography variant="b4" color={getColor("green", 400)}>
                            {event.name}
                        </Typography>
                    </View>
                </View>
            </View>

            <View style={styles.Vstack}>
                <View style={styles.feedbackLayout}>
                    <Typography variant="b3" color={getColor("yellow")}>
                        Rate
                    </Typography>
                    <StarRating
                        disabled={!isStarted}
                        value={userRating.score}
                        onChange={(score: number) => onRatingChange(index, score)}
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
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
    borderBottom: {
        borderBottomWidth: 1,
        borderBottomColor: getColor("green", 700, 0.15),
        paddingBottom: 12,
    },
    feedbackLayout: {
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: 'space-between',
        width: '100%'
    },
});