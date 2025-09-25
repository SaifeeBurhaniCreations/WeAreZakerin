import React from 'react';
import { View, StyleSheet } from 'react-native';
import Typography from '../typography/Typography';
import Button from '../ui/Button';
import { getColor } from '../../constants/colors';

interface ErrorBoundaryProps {
    hasError: boolean;
    errorMessage: string;
    onRetry: () => void;
}

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ hasError, errorMessage, onRetry }) => {
    if (!hasError) return null;

    return (
        <View style={styles.container}>
            <Typography variant="h6" color={getColor("red", 400)}>
                {errorMessage || 'Something went wrong'}
            </Typography>
            <Button
                onPress={onRetry}
                variant="outline"
                style={{ marginTop: 16 }}
            >
                Try Again
            </Button>
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

export default ErrorBoundary;