import { ComponentType, ReactNode } from "react";
import { TextInputProps, ViewStyle } from "react-native";
import { GestureResponderEvent, ImageSourcePropType } from "react-native";
import { RootStackParamList } from "./navigation";
import { User } from "../redux/slices/UserSlice";
import { Group } from "../redux/slices/AddPartySlice";
import { Occassion } from "../redux/slices/OccassionSlice";
import { miqaatProps } from "./event";


export interface ButtonProps {
    onPress?: (event: GestureResponderEvent) => void;
    children: ReactNode;
    size?: "sm" | "md" | "lg" | "xl" | "xs";
    color?: "red" | "green" | "blue" | "yellow";
    full?: boolean;
    variant?: "fill" | "outline";
    disabled?: boolean;
    style?: ViewStyle
}

export interface KalamOption {
    label: string;
    value: string;
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

export interface Assignment {
    name: string;
    party: string;
}

export interface CreateEventData {
    month: number;
    date: number;
    miqaat: miqaatProps;
}

export interface CalendarState {
    currentIslamicYear: number;
    currentIslamicMonthIndex: number;
    selectedDay: number;
    selectedDateString: string;
    hasError: boolean;
    errorMessage: string;
}

export interface CalendarDay {
    date: Date;
    islamicDate: { year: number; monthIndex: number; day: number };
    dateString: string;
    isToday: boolean;
    isSelected: boolean;
    events: miqaatProps[];
    highestPriority: number;
}

export interface ValidationErrors {
    eventName?: string;
    eventDescription?: string;
    eventLocation?: string;
    selectedParty?: string;
    date?: string;
    selectedStartTime?: string;
    assignments?: string;
    general?: string
}

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
    disabled?: boolean;
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
    disabled?: boolean;
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
    groups: Group[],
    pressable?: boolean,
    onPress?: keyof RootStackParamList
}
export interface OccassionFlatListProps {
    occassions: Occassion[],
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

export type Rating = {
    score: number;
    ratingBy: string;
};

export interface AttendanceStatus {
    userId: string;
    status: "absent" | "present" | "late" | "excused";
    fullname: string;
    checkedInAt?: Date;
}

export type Event = {
    _id?: string;
    name?: string;
    type: string;
    party: string;
    rating: Rating[];
};

export interface EventData {
    _id: string;
    name: string;
    party: string;
    rating: Rating[];
}

export interface EventFormType {
    // State
    eventName: string;
    eventDescription: string;
    eventLocation: string;
    eventSwitchValue: boolean;
    date: string;
    selectedStartTime: Date | null;
    assignments: Assignment[];
    validationErrors: ValidationErrors;
    isSubmitting: boolean;
    isInstant: boolean;

    // Actions
    setEventName: (name: string) => void;
    setEventDescription: (description: string) => void;
    setEventLocation: (location: string) => void;
    setEventSwitchValue: (value: boolean) => void;
    setDate: (date: string) => void;
    setSelectedStartTime: (time: Date | null) => void;
    setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>;
    setValidationErrors: React.Dispatch<React.SetStateAction<ValidationErrors>>;
    setIsSubmitting: (submitting: boolean) => void;
    setIsInstant: (instant: boolean) => void;

    // Methods
    resetForm: () => void;
    validateEventForm: () => ValidationErrors;

    // Assignment management (optional)
    addAssignment?: () => void;
    removeAssignment?: (index: number) => void;
    updateAssignment?: (index: number, field: keyof Assignment, value: string) => void;
}