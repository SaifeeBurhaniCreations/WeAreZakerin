import {
    Modal,
    Pressable,
    View,
    TextInput,
    StyleSheet,
    Text,
    ViewStyle,
    TextStyle,
} from "react-native";
import { useState } from "react";
import { getColor } from "@/src/constants/colors";
import { InputProps } from "@/src/types";
import ClockIcon from "../icons/ClockIcon";
import Calendar12Icon from "../icons/Calendar12Icon";
import Typography from "../typography/Typography";

type Size = "sm" | "md" | "lg";

const SIZE_STYLES: Record<
    Size,
    {
        height: number;
        paddingHorizontal: number;
        fontSize: number;
        iconSize: number;
        borderRadius: number;
    }
> = {
    sm: {
        height: 36,
        paddingHorizontal: 10,
        fontSize: 14,
        iconSize: 18,
        borderRadius: 8,
    },
    md: {
        height: 46,
        paddingHorizontal: 12,
        fontSize: 16,
        iconSize: 22,
        borderRadius: 10,
    },
    lg: {
        height: 48,
        paddingHorizontal: 16,
        fontSize: 18,
        iconSize: 24,
        borderRadius: 12,
    },
};

const Input = ({
    children,
    placeholder,
    onChangeText,
    onBlur,
    onFocus,
    value,
    color = "green",
    icon,
    post,
    addonText,
    error,
    secureTextEntry,
    keyboardType,
    maxLength,
    mask,
    disabled,
    style,
    onIconPress,
    size = "md",
    ...props
}: InputProps & { size?: Size }) => {
    const [isFocused, setIsFocused] = useState(false);

    const {
        height,
        paddingHorizontal,
        fontSize,
        iconSize,
        borderRadius,
    } = SIZE_STYLES[size] || SIZE_STYLES.lg;

    const renderIcon = (iconNode: React.ReactNode, onPress?: () => void) => {
        const isString = typeof iconNode === "string";

        return (
            <Pressable
                onPress={onPress}
                style={[styles.icon, { width: iconSize, height: iconSize, paddingHorizontal: 4 }]}
                disabled={disabled}
            >
                {isString ? (
                    <Typography variant="b3" style={{ fontSize }}>
                        {iconNode}
                    </Typography>
                ) : (
                    iconNode
                )}
                {mask === "time" ? (
                    <ClockIcon size={iconSize} />
                ) : mask === "date" ? (
                    <Calendar12Icon size={iconSize} />
                ) : null}
            </Pressable>
        );
    };

    const renderAddonText = (text: string) => (
        <Typography
            variant="b2"
            color={getColor("green", 200)}
            style={[styles.addonText, { fontSize }]}
            numberOfLines={1}
            ellipsizeMode="tail"
        >
            {text}
        </Typography>
    );

    const inputWithIcon = (
        <View
            style={[
                styles.inputWrapper,
                {
                    borderColor: error ? getColor("red", 300) : getColor(color, 100),
                    paddingHorizontal,
                    height,
                    borderRadius,
                    opacity: disabled ? 0.8 : 1,
                    backgroundColor: disabled
                        ? getColor("dark", 100, 0.2)
                        : getColor("light"),
                } satisfies ViewStyle,
                style,
            ]}
        >
            {!post && (icon || mask === "time" || mask === "date") && renderIcon(icon, onIconPress)}
            {!post && addonText && renderAddonText(addonText)}

            <TextInput
                style={[styles.textInput, { fontSize, height }]}
                placeholder={placeholder}
                onChangeText={onChangeText}
                onBlur={(e) => {
                    setIsFocused(false);
                    onBlur?.(e);
                }}
                onFocus={(e) => {
                    setIsFocused(true);
                    onFocus?.(e);
                }}
                placeholderTextColor={getColor("green", 700, 0.7)}
                textAlignVertical="center"
                value={value}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                maxLength={maxLength}
                editable={!disabled}
                pointerEvents={mask === "date" || mask === "time" ? "none" : undefined}
                {...props}
            />

            {post && addonText && renderAddonText(addonText)}
            {post && icon && renderIcon(icon, onIconPress)}
        </View>
    );

    return children ? (
        <View style={styles.inputContainer}>
            <Typography variant="h5">{children}</Typography>
            {inputWithIcon}
            {error && <Typography variant="b4" color={getColor("red", 700)}>{error}</Typography>}
        </View>
    ) : (
        inputWithIcon
    );
};

export default Input;

const styles = StyleSheet.create({
    inputContainer: {
        flexDirection: "column",
        gap: 8,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        backgroundColor: getColor("light"),
    },
    textInput: {
        fontFamily: "FunnelSans-Regular",
        color: getColor("green", 400),
        paddingVertical: 0,
        flex: 1,
    },
    icon: {
        justifyContent: "center",
        alignItems: "center",
    },
    addonText: {
        paddingRight: 8,
    },
});
