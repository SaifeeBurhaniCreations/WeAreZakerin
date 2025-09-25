// utils/roles.ts
import { RootStackParamList } from "../types";

// Users and roles
export type UserRole = "admin" | "member" | "superadmin" | "groupadmin"; 

export type RouteNames = keyof RootStackParamList;

export const routeRoles: Record<RouteNames, UserRole[]> = {
    Home: ["admin", "superadmin"],
    Users: ["admin", "superadmin", "member"],
    OccasionList: ["admin", "superadmin"],
    OccasionDetail: ["admin", "superadmin"],
    ManageOccasion: ["admin", "superadmin"],
    OccasionAttendance: ["admin", "superadmin"],
    Profile: ["admin", "superadmin", "member"],
    EditProfile: ["admin", "superadmin", "member"],
    ScheduleEvent: ["admin", "superadmin", "member"],
    Piano: ["admin", "superadmin", "member"],
    Login: ["member", "superadmin", "admin"],
    Landing: ["member", "superadmin", "admin"],
    Loader: ["member", "superadmin", "admin"],
};

export function isAllowed(role: UserRole, routeName: RouteNames): boolean {
    const allowed = routeRoles[routeName];
    // console.log(role, allowed.includes(role));

    if (!allowed) return false;
    return allowed.includes(role);
}
