import React from "react";
import { View, TouchableOpacity, StyleProp, ViewStyle } from "react-native";
import FilledStarIcon from "../icons/FilledStarIcon";
import { getColor } from "@/src/constants/colors";

interface StarRatingProps {
    maxStars?: number; 
    value?: number; 
    disabled?: boolean; 
    onChange: (rating: number) => void; 
    style?: StyleProp<ViewStyle>; 
}

const StarRating: React.FC<StarRatingProps> = ({
    maxStars = 5,
    value = 0,
    onChange,
    style,
    disabled
}) => {
    return (
        <View
            style={[
                { flexDirection: "row", justifyContent: "center", gap: 8 },
                style,
            ]}
        >
            {Array.from({ length: maxStars }).map((_, i) => (
                <TouchableOpacity
                    disabled={disabled}
                    key={i}
                    onPress={() => onChange(i + 1)}
                    activeOpacity={0.7}
                >
                    <FilledStarIcon
                        filled={i < value}
                        size={24}
                        color={getColor("green")}
                    />
                </TouchableOpacity>
            ))}
        </View>
    );
};

export default StarRating;
