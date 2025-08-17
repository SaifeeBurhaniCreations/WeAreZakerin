import { differenceInCalendarDays, differenceInMinutes, differenceInHours, differenceInSeconds, format, formatDistanceToNow } from "date-fns";
import { KalamOption } from "../types";

export function findPadding(size: string | undefined) {
    switch (size) {
        case "sm":
            return { paddingHorizontal: 4, paddingVertical: 2 };
        case "md":
            return { paddingHorizontal: 6, paddingVertical: 4 };
        case "lg":
            return { paddingHorizontal: 8, paddingVertical: 6 };
        case "xl":
            return { paddingHorizontal: 10, paddingVertical: 8 };
        default:
            return { paddingHorizontal: 8, paddingVertical: 6 };
    }
}

export const getTagFont = (size: string) => {
    switch (size) {
        case "sm": return "b4";
        case "md": return "b3";
        case "lg": return "b2";
        case "xl": return "b1";
        default: return "b3";
    }
};

export const formatTimeAgo = (date: Date) => {
    const seconds = differenceInSeconds(new Date(), date);

    if (seconds < 60) {
        return `${seconds} sec${seconds !== 1 ? "s" : ""} ago`;
    }

    return formatDistanceToNow(date, { addSuffix: true });
};

export const formatDateAgo = (date: Date) => {
    const days = differenceInCalendarDays(new Date(), date);

    if (days === 0) {
        return formatTimeAgo(date);
    }

    if (days === 1) {
        return "Yesterday";
    }

    if (days < 7) {
        return `${days} days ago`;
    }

    return format(date, "d MMM yyyy");
};

export const formatTimeLeft = (date: Date) => {
    const now = new Date();

    if (date < now) {
        return "Expired"; // or return formatTimeAgo(date) if you want past dates
    }

    const days = differenceInCalendarDays(date, now);
    const hours = differenceInHours(date, now);
    const minutes = differenceInMinutes(date, now);
    const seconds = differenceInSeconds(date, now);

    // Same day → show hours, minutes, or seconds
    if (days === 0) {
        if (hours > 0) {
            return `${hours} hour${hours !== 1 ? "s" : ""} left`;
        }
        if (minutes > 0) {
            return `${minutes} minute${minutes !== 1 ? "s" : ""} left`;
        }
        return `${seconds} second${seconds !== 1 ? "s" : ""} left`;
    }

    // Tomorrow
    if (days === 1) {
        return "Tomorrow";
    }

    // Less than a week
    if (days < 7) {
        return `${days} days left`;
    }

    // Longer → show date
    return format(date, "d MMM yyyy");
};

// Constants
export const KALAM_OPTIONS: KalamOption[] = [
    { label: "Salam", value: "salam" },
    { label: "Noha", value: "noha" },
    { label: "Madeh", value: "madeh" },
    { label: "Nasihat", value: "nasihat" },
    { label: "Rasa", value: "rasa" },
    { label: "Na'at", value: "na'at" },
    { label: "Ilteja", value: "ilteja" },
];

export const capitalizeFirstLetter = (str: string): string => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};

export const normalizeString = (str: string): string => {
    if (!str) return '';
    return str.trim().toLowerCase();
};
  
export function formatDateCustom(dateString: string | undefined) {
    if (!dateString) return "N/A"; // fallback for null/undefined
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date"; // fallback for invalid strings
    return date.toLocaleDateString(); // or your preferred format
  }
  