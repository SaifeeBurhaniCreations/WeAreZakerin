import CalenderIcon from "../components/icons/CalendarIcon";
import UserIcon from "../components/icons/AddGroupIcon";
import { FebItemsProps } from "../types";
import AdminIcon from "../components/icons/AdminIcon";

export const FAB_ITEMS: FebItemsProps[] = [
    {
        id: 0,
        text: "Add Party",
        icon: UserIcon,
    },
    {
        id: 1,
        text: "Add Admin",
        icon: AdminIcon,
    },
    {
        id: 2,
        text: "Schedule Event",
        icon: CalenderIcon,
    },
]