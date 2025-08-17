import { getColor } from "@/src/constants/colors";
import { AttendanceStatus, Event } from "../types";

export const getStatusColor = (status: string) => {
    switch (status) {
        case "present":
            return { bg: getColor("green", 100), text: getColor("green", 700) };
        case "late":
            return { bg: getColor("yellow", 100), text: getColor("yellow", 600) };
        case "excused":
            return { bg: getColor("blue", 100), text: getColor("blue", 600) };
        default:
            return { bg: getColor("red", 100), text: getColor("red", 600) };
    }
};

export const buildAttendeesFromUsers = (
    users: any[],
    occasionAttendees: string[],
    groupMembers: string[]
): AttendanceStatus[] => {
    if (!users?.length) return [];

    const attendanceSet = new Set(occasionAttendees || []);
    const combinedUserIds = new Set([...occasionAttendees, ...groupMembers]);

    return Array.from(combinedUserIds)
        .map((userId) => {
            const user = users.find((u) => u._id === userId);
            if (!user) return null;
            
            return {
                userId: user._id,
                fullname: user.fullname,
                status: attendanceSet.has(userId) ? "present" : "absent",
            };
        })
        .filter(Boolean) as AttendanceStatus[];
};

export const prepareUpdatePayload = (events: Event[], attendance: AttendanceStatus[]) => ({
    events,
    attendance: attendance.map(att => ({
        userId: att.userId,
        status: att.status,
        fullname: att.fullname,
        checkedInAt: att.status === "present" ? new Date() : null,
    })),
});