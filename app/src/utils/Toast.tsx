// utils/Toast.tsx
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { AppToast, ToastVariant } from '../components/ui/AppToast';

let toastRef: ((jsx: JSX.Element) => void) | null = null;

export const ToastRoot = () => {
    const [toast, setToast] = React.useState<JSX.Element | null>(null);

    React.useEffect(() => {
        toastRef = setToast;
        return () => {
            toastRef = null;
        };
    }, []);

    return toast ? (
        <View style={styles.wrapper}>
            {toast}
        </View>
    ) : null;
};

export const Toast = {
    show: ({
        title,
        description,
        variant,
        duration = 3000,
    }: {
        title: string;
        description: string;
        variant: ToastVariant;
        duration?: number;
    }) => {
        if (toastRef) {
            const remove = () => toastRef?.(null);
            toastRef(
                <AppToast
                    title={title}
                    description={description}
                    variant={variant}
                    onClose={remove}
                />
            );

            setTimeout(remove, duration);
        }
    },
};

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        top: 50,
        left: 0,
        right: 0,
        zIndex: 9999,
        alignItems: 'center',
    },
});
