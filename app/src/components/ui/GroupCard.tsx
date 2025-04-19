import { getColor } from '@/src/constants/colors';
import { GroupCardProps } from '@/src/types';
import { Image, StyleSheet, View } from 'react-native';
import Typography from '../typography/Typography';
import Tag from './Tag';

const GroupCard = ({ item }: GroupCardProps) => {
    return (
        <View style={styles.card}>
            <View style={styles.cardTitleContainer}>
                <Image source={item.image} style={{ width: 50, height: 50, borderRadius: 50 }} />
                <View style={styles.Vstack}>
                    <View style={styles.Hstack}>
                        <Typography variant='h4' color={getColor("green", 700)}>{item.name}</Typography>
                        {item.tag !== "" && (<Tag size='sm'>Me</Tag>)}
                    </View>
                    <Typography variant='b4' color={getColor("green", 400)}>
                        {item.admin}{" "} • {" "} {item.member.length} member{item.member.length === 1 ? "" : "s"}
                    </Typography>
                </View>
            </View>
        </View>
    );
};

export default GroupCard;

const styles = StyleSheet.create({
    card: {
        backgroundColor: getColor("light"),
        paddingHorizontal: 12,
        paddingVertical: 16,
        gap: 8,
        flexDirection: "column",
        borderRadius: 16,
        // Box shadow for iOS
        shadowColor: 'rgba(0, 17, 13, 0.06)',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 1,
        shadowRadius: 12,
        // Box shadow for Android
        elevation: 6,
    },
    cardTitleContainer: {
        flexDirection: "row",
        gap: 16,
    },
    Hstack: {
        flexDirection: "row",
        gap: 8,
    },
    Vstack: {
        flexDirection: "column",
    },
});
