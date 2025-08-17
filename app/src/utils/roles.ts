// utils/roles.ts
import { RootStackParamList } from "../types";

// Users and roles
export type UserRole = "admin" | "member" | "superadmin" | "groupadmin"; 

export type RouteNames = keyof RootStackParamList;

export const routeRoles: Record<RouteNames, UserRole[]> = {
    Home: ["admin", "superadmin", "member"],
    Users: ["admin", "superadmin"],
    OccasionList: ["admin", "superadmin", "member"],
    OccasionDetail: ["admin", "superadmin", "member"],
    ManageOccasion: ["admin", "superadmin"],
    OccasionAttendance: ["admin", "superadmin"],
    Profile: ["admin", "superadmin", "member"],
    EditProfile: ["admin", "superadmin", "member"],
    ScheduleEvent: ["admin", "superadmin", "member"],
    Piano: ["admin", "superadmin", "member", "member"],
    Login: ["member", "superadmin"],
    Landing: ["member", "superadmin"],
    Loader: ["member", "superadmin"],
};

export function isAllowed(role: UserRole, routeName: RouteNames): boolean {
    const allowed = routeRoles[routeName];
    // console.log(role, allowed.includes(role));

    if (!allowed) return false;
    return allowed.includes(role);
}
