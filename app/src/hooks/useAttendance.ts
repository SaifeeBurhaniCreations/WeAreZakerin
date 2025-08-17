import { useState, useCallback, useMemo } from "react";
import { AttendanceStatus } from "../types";

export const useAttendance = (initialAttendees: AttendanceStatus[] = []) => {
    const [attendees, setAttendees] = useState<AttendanceStatus[]>(initialAttendees);
    const [isLoading, setIsLoading] = useState(false);

    const updateAttendance = useCallback((userId: string, status: "present" | "absent") => {
        setAttendees(prev => 
            prev.map(att => 
                att.userId === userId 
                    ? { ...att, status, checkedInAt: status === "present" ? new Date() : undefined }
                    : att
            )
        );
    }, []);

    const getAttendanceStatus = useCallback((userId: string) => {
        return attendees.find(att => att.userId === userId)?.status || "absent";
    }, [attendees]);

    const attendanceStats = useMemo(() => {
        const present = attendees.filter(att => att.status === "present").length;
        const absent = attendees.filter(att => att.status === "absent").length;
        const total = attendees.length;
        
        return { present, absent, total, percentage: total ? (present / total) * 100 : 0 };
    }, [attendees]);

    return {
        attendees,
        setAttendees,
        updateAttendance,
        getAttendanceStatus,
        attendanceStats,
        isLoading,
        setIsLoading,
    };
};