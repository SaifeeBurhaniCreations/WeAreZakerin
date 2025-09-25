import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import Typography from '../typography/Typography';
import { getColor } from '../../constants/colors';

interface LoadingStateProps {
    message?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading...' }) => {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color={getColor("blue", 400)} />
            <Typography variant="h6" style={{ marginTop: 16 }}>{message}</Typography>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
});