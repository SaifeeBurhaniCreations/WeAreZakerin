import { ReactNode } from "react";
import { GestureResponderEvent, ImageSourcePropType } from "react-native";
import { ImageProps } from "react-native";

export interface ButtonProps {
    onPress?: (event: GestureResponderEvent) => void;
    children: ReactNode;
    size?: "sm" | "md" | "lg" | "xl";
    full?: boolean;
    variant?: "fill" | "outline";
}

export interface GroupCardProps {
    item: {
        name: string,
        admin: string,
        member: string[] | number[],
        image: ImageSourcePropType;
        tag: string;
    }
}

export interface TagProps {
    size?: "sm" | "md" | "lg" | "xl";
    color?: "red" | "green" | "blue" | "yellow";
    children: ReactNode;
}