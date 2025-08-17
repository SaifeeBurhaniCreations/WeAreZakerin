import { StyleSheet, Text, View } from 'react-native'
import React, { Fragment } from 'react'
import Typography from '../typography/Typography';
import { getColor } from '@/src/constants/colors';

const InfoRow = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value?: string | number }) => (
    <Fragment>
        <View style={[styles.infoRow]}>
            <Icon size={16} color={getColor("green", 400)} />
            <Typography variant="h6" color={getColor("green", 400)}>{label}</Typography>
        </View>
        <Typography variant="b4" style={{ flexShrink: 1 }}>{value || "---"}</Typography>
    </Fragment>
);

export default InfoRow

const styles = StyleSheet.create({
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingVertical: 2,
    },
})