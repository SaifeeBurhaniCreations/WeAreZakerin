import {
    Modal,
    Pressable,
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    TextStyle,
    ViewStyle,
    Dimensions,
} from "react-native";
import { useState, useMemo } from "react";
import { getColor } from "@/src/constants/colors";
import { SelectProps } from "@/src/types";
import { useWindowDimensions } from "react-native";
import ChevronDownIcon from "../icons/ChevronDownIcon";

type Size = "sm" | "md" | "lg";

const SIZE_STYLES: Record<
    Size,
    {
        paddingVertical: number;
        paddingHorizontal: number;
        fontSize: number;
        iconSize: number;
        borderRadius: number;
        sheetMaxHeightPercent: number;
    }
> = {
    sm: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        fontSize: 14,
        iconSize: 18,
        borderRadius: 8,
        sheetMaxHeightPercent: 0.4,
    },
    md: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        fontSize: 16,
        iconSize: 22,
        borderRadius: 10,
        sheetMaxHeightPercent: 0.45,
    },
    lg: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        fontSize: 18,
        iconSize: 24,
        borderRadius: 12,
        sheetMaxHeightPercent: 0.5,
    },
};

const Select = ({
    options,
    placeholder = "Select",
    onSelect,
    value,
    style,
    disabled = false,
    size = "md",
}: SelectProps & { size?: Size }) => {
    const [visible, setVisible] = useState(false);
    const { width, height } = useWindowDimensions();
    const isLandscape = width > height;

    // Extract size styles or fallback to lg
    const {
        paddingVertical,
        paddingHorizontal,
        fontSize,
        iconSize,
        borderRadius,
        sheetMaxHeightPercent,
    } = SIZE_STYLES[size] || SIZE_STYLES.lg;

    // Memoize selected label for performance
    const selectedLabel = useMemo(() => {
        const selectedOption = options.find((option) => option.value === value);
        return selectedOption ? selectedOption.label : placeholder;
    }, [options, value, placeholder]);

    return (
        <View style={style}>
            <Pressable
                style={[
                    styles.trigger,
                    {
                        paddingVertical,
                        paddingHorizontal,
                        borderRadius,
                        opacity: disabled ? 0.8 : 1,
                        backgroundColor: disabled
                            ? getColor("dark", 100, 0.2)
                            : getColor("light"),
                    } satisfies ViewStyle,
                ]}
                disabled={disabled}
                onPress={() => setVisible(true)}
            >
                <Text
                    style={[styles.triggerText, { fontSize }]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {selectedLabel}
                </Text>
                <ChevronDownIcon size={iconSize} />
            </Pressable>

            <Modal
                visible={visible}
                animationType="slide"
                transparent
                onRequestClose={() => setVisible(false)}
            >
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={() => setVisible(false)}
                >
                    <View
                        style={[
                            styles.sheet,
                            {
                                maxHeight: height * sheetMaxHeightPercent,
                                borderRadius,
                                width: isLandscape ? "70%" : "100%",
                                alignSelf: isLandscape ? "center" : undefined,
                            } satisfies ViewStyle,
                        ]}
                    >
                        <FlatList
                            data={options}
                            keyExtractor={(item) => item.value}
                            keyboardShouldPersistTaps="handled"
                            renderItem={({ item, index }) => {
                                const isLast = index === options.length - 1;
                                const isSelected = value === item.value;

                                return (
                                    <TouchableOpacity
                                        disabled={item.disabled}
                                        style={[
                                            styles.item,
                                            {
                                                paddingVertical,
                                                paddingHorizontal,
                                            } satisfies ViewStyle,
                                            item.disabled && { opacity: 0.3 },
                                            isSelected && {
                                                backgroundColor: getColor("green", 100),
                                            },
                                            !isLast && {
                                                borderBottomWidth: StyleSheet.hairlineWidth,
                                                borderColor: getColor("green", 100),
                                            },
                                        ]}
                                        onPress={() => {
                                            onSelect(item.value);
                                            setVisible(false);
                                        }}
                                    >
                                        <Text
                                            style={[styles.itemText, { fontSize }]}
                                            numberOfLines={1}
                                            ellipsizeMode="tail"
                                        >
                                            {item.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            }}
                            contentContainerStyle={{
                                paddingHorizontal: paddingHorizontal,
                                paddingVertical: 4,
                            }}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

export default Select;

const styles = StyleSheet.create({
    trigger: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: getColor("green", 100),
    },
    triggerText: {
        color: getColor("green", 700),
        flexShrink: 1,
    },
    backdrop: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0,0,0,0.4)",
    },
    sheet: {
        backgroundColor: getColor("light"),
        marginHorizontal: 8,
        marginBottom: 8,
    },
    item: {
        justifyContent: "center",
    },
    itemText: {
        color: getColor("dark", 900),
    },
});
