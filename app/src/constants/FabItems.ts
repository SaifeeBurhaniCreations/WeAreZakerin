import CalenderIcon from "../components/icons/CalendarIcon";
import UserIcon from "../components/icons/AddGroupIcon";
import { FebItemsProps } from "../types";

export const FAB_ITEMS: FebItemsProps[] = [
    {
        text: "Add Party",
        icon: UserIcon,
    },
    {
        text: "Schedule Event",
        icon: CalenderIcon,
    },
]