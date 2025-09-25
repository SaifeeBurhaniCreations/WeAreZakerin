import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Typography from '../typography/Typography';
import { getColor } from '../../constants/colors';

interface NetworkErrorBannerProps {
    error: string | null;
    onRetry: () => void;
}

const NetworkErrorBanner: React.FC<NetworkErrorBannerProps> = ({ error, onRetry }) => {
    if (!error) return null;

    return (
        <View style={styles.container}>
            <Typography variant="b4" color={getColor("red", 600)}>
                {error}
            </Typography>
            <TouchableOpacity onPress={onRetry}>
                <Typography variant="b4" color={getColor("blue", 600)}>
                    Retry
                </Typography>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: getColor("red", 50),
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
});