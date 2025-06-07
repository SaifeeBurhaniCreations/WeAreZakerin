import {
    Modal,
    Pressable,
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import { useState } from "react";
import { getColor } from "@/src/constants/colors";
import { ChevronDownIcon } from "@/components/ui/icon";
import { SelectProps } from "@/src/types";
import { useWindowDimensions } from "react-native";

const Select = ({ options, placeholder = "Select", onSelect, value }: SelectProps) => {
    const [visible, setVisible] = useState(false);
    const { width, height } = useWindowDimensions();
    const isLandscape = width > height;

    const selectedLabel =
        options.find((option) => option.value === value)?.label || placeholder;

    return (
        <View>
            <Pressable style={styles.trigger} onPress={() => setVisible(true)}>
                <Text style={styles.triggerText}>{selectedLabel}</Text>
                <ChevronDownIcon width={24} height={24} />
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
                            isLandscape && {
                                width: "70%",
                                alignSelf: "center",
                                borderRadius: 20,
                            },
                        ]}>

                        <FlatList
                            data={options}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item, index }) => {
                                const isLast = index === options.length - 1;
                                return (
                                    <TouchableOpacity
                                        disabled={item.disabled}
                                        style={[
                                            styles.item,
                                            item.disabled && { opacity: 0.3 },
                                            value === item.value && styles.selectedItem,
                                            !isLast && styles.divider, 
                                        ]}
                                        onPress={() => {
                                            onSelect(item.value);
                                            setVisible(false);
                                        }}
                                    >
                                        <Text>{item.label}</Text>
                                    </TouchableOpacity>
                                );
                            }}
                            
                            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 4 }}
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
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: getColor("green", 100),
        borderRadius: 12,
        backgroundColor: getColor("light"),
    },
    triggerText: {
        color: getColor("green", 700),
        fontSize: 16,
    },
    backdrop: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0,0,0,0.4)",
    },
    sheet: {
        backgroundColor: getColor("light"),
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: "50%",
        marginHorizontal: 8,
        marginBottom: 8,
    },
    item: {
        paddingVertical: 12,
        paddingHorizontal: 12,
    },
    selectedItem: {
        backgroundColor: getColor("green", 100),
    },
    divider: {
        borderBottomWidth: 1,
        borderColor: getColor("green", 100),
    },
});
