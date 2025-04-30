import { ComponentType, ReactNode } from "react";
import { TextInputProps } from "react-native";
import { GestureResponderEvent, ImageSourcePropType } from "react-native";

export interface ButtonProps {
    onPress?: (event: GestureResponderEvent) => void;
    children: ReactNode;
    size?: "sm" | "md" | "lg" | "xl";
    full?: boolean;
    variant?: "fill" | "outline";
    disabled?: boolean;
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
    onPress?: () => void;
    onClose?: () => void;
    disabled?: boolean;
};


export interface InputProps {
    onChangeText?: any;
    onBlur?: any;
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
    mask?: "time";
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
  

  export const screenTitleMap: Record<string, string> = {
    EditProfile: 'Edit Profile',
    Home: 'Home',
    Users: 'User',
    Profile: 'Profile',
    ScheduleEvent: 'Schedule Event',
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