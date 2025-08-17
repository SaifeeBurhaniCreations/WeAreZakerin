// hooks/useAuthGuard.ts
import { useSelector } from "react-redux";
import { RootState } from "@/src/redux/store";
import { UserRole, isAllowed } from "@/src/utils/roles";
import { RootStackParamList } from "../types";

type RouteName = keyof RootStackParamList;

export const useAuthStatus = () => {
    const { me } = useSelector((state: RootState) => state.users);
    const role: UserRole = me?.role || "member";
    return { role };
};

export const useRoleGuard = (routeName: RouteName) => {
    const { role } = useAuthStatus();
    return isAllowed(role, routeName);
};
