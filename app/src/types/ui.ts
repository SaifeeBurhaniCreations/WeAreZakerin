import { ElementType, ReactNode } from "react";
import { GestureResponderEvent, ImageSourcePropType } from "react-native";

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
    },
    pressable?: boolean;
    onPress?: () => void;
}
export interface UserCardProps {
    item: {
        name: string,
        its: string,
        title: string,
        image: ImageSourcePropType;
        tag: string;
    },
    pressable?: boolean;
    onPress?: () => void;
}

export interface TagProps {
    size?: "sm" | "md" | "lg" | "xl";
    color?: "red" | "green" | "blue" | "yellow";
    children: ReactNode;
}

export type AddDataModalRef = {
    open: () => void;
    close: () => void;
};

export type AddDataModalProps = {
    title: string;
    children?: ReactNode;
    footer?: string;
};


export type InputProps = {
    icon?: ElementType;
    iconSize?: number;
    disabled?: boolean;
    placeholder?: string;
    post?: boolean;
    style?: any;
};

export type Option = {
    label: string;
    value: string;
    disabled?: boolean;
};

export type SelectProps = {
    options: Option[];
    placeholder?: string;
    onSelect: (value: string) => void;
    value?: string;
};

export interface IconProps {
    color?: string;
    size?: number;
    style?: any;
}

export interface SwitchProps {
    text?: string | [string, string]
    style?: any
    value?: boolean
    onValueChange?: (value: boolean) => void
  }
  
