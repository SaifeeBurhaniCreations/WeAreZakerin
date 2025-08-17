import { ComponentType, ReactNode } from "react";
import { TextInputProps, ViewStyle } from "react-native";
import { GestureResponderEvent, ImageSourcePropType } from "react-native";
import { RootStackParamList } from "./navigation";
import { User } from "../redux/slices/UserSlice";
import { Group } from "../redux/slices/AddPartySlice";


export interface ButtonProps {
    onPress?: (event: GestureResponderEvent) => void;
    children: ReactNode;
    size?: "sm" | "md" | "lg" | "xl";
    color?: "red" | "green" | "blue" | "yellow";
    full?: boolean;
    variant?: "fill" | "outline";
    disabled?: boolean;
    style?: ViewStyle
}

export interface GroupCardProps {
    item: {
        name: string,
        admin: string,
        members: string[] | number[],
        image: ImageSourcePropType;
        tag: boolean;
        id: string;
        _id: string;
    },
    pressable?: boolean;
    onPress?: keyof RootStackParamList;
}
export interface UserCardProps {
    item: {
        fullname: string,
        admin?: string;
        me?: string;
        userid: string,
        title: string,
        image: ImageSourcePropType;
        tag: boolean;
    },
    pressable?: boolean;
    onPress?: keyof RootStackParamList;
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
    onPress?: () => void;
    onClose?: () => void;
    disabled?: boolean;
};


export interface InputProps extends TextInputProps {
    onChangeText?: any;
    onBlur?: any;
    onFocus?: any;
    children?: ReactNode;
    placeholder?: string;
    value?: string;
    color?: "red" | "blue" | "green" | "yellow";
    icon?: ReactNode;            
    post?: boolean;
    addonText?: string;
    error?: any;
    secureTextEntry?: boolean;
    keyboardType?: TextInputProps['keyboardType'];
    maxLength?: number;
    mask?: "time" | "date";
    onIconPress?: () => void;  
    style?: any;  
}

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
    style?: ViewStyle;
};

export interface IconProps {
    color?: string;
    size?: number;
    style?: any;
    onPress?: () => void;
}

export interface SwitchProps {
    text?: string | [string, string]
    style?: any
    value?: boolean
    onValueChange?: (value: boolean) => void
  }
  
  export interface PageHeaderProps {
    title: string
    goBack?: () => void
    canGoBack?: boolean
  }
  
  export interface FabProps {
    position: "left" | "right";
    color: "red" | "green" | "blue" | "yellow"
}
export interface FebItemsProps {
    id: number;
    text: string;
    icon: ComponentType<IconProps>;
}

    export interface GroupCardProps {
    id: string;
    _id: string;
    image: ImageSourcePropType;
    name: string;
    members: string[] | number[];
    admin: string;
    tag: string;
    }

export interface GroupFlatListProps {
    groups : Group[],
    pressable?: boolean, 
    onPress?: keyof RootStackParamList
}
    export interface UserCardProps {
    _id: string;
    id: string;
    admin?: string;
    me?: string;
    image: ImageSourcePropType;
    fullname: string;
    title: string;
    userid: string;
    tag: boolean;
    }

export interface UserFlatListProps {
        users: User[],
        admin: string,
        me: string,
        pressable?: boolean,
        onPress?: keyof RootStackParamList,
}


export interface UserAbc {
    
}