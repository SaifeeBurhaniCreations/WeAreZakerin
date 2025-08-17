// components/AppToast.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

const toastThemes: Record<
    ToastVariant,
    { color: string; icon: string }
> = {
    success: { color: '#34D399', icon: 'check-circle' },
    error: { color: '#F87171', icon: 'error' },
    info: { color: '#60A5FA', icon: 'info' },
    warning: { color: '#FBBF24', icon: 'warning' },
};

type AppToastProps = {
    title: string;
    description: string;
    variant: ToastVariant;
    onClose: () => void;
};

export const AppToast: React.FC<AppToastProps> = ({
    title,
    description,
    variant,
    onClose,
}) => {
    const theme = toastThemes[variant];

    return (
        <View style={[styles.toastContainer, { borderColor: theme.color }]}>
            <Icon name={theme.icon} size={28} color={theme.color} />
            <View style={styles.textContainer}>
                <Text style={[styles.title]}>{title}</Text>
                <Text style={styles.description}>{description}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Icon name="close" size={20} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    toastContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: 'white',
        borderRadius: 12,
        borderWidth: 1.5,
        padding: 16,
        elevation: 6,
        maxWidth: 350,
        marginHorizontal: 16,
    },
    textContainer: {
        flex: 1,
        marginLeft: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
    },
    closeButton: {
        marginLeft: 8,
        marginTop: 2,
    },
});
