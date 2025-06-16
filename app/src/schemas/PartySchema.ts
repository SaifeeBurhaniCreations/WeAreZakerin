// PartySchema.ts
import { z } from "zod";

export const partySchema = z.object({
    selectedValue: z.string().min(1, "Choose an Admin"),
    fullname: z.string().optional(),
    phone: z.string().optional(),
    userid: z.string().optional(),
    address: z.string().optional(),
    name: z.string(),
}).refine((data) => {
    if (data.selectedValue === "add_admin") {
        return (
            !!data.fullname?.trim() &&
            /^\d{10}$/.test(data.phone || "") &&
            /^\d{8}$/.test(data.userid || "") &&
            !!data.address?.trim()
        );
    }
    return true; // skip validation for other values
}, {
    message: "Fill all fields for new admin",
    path: ["fullname"], // Any field, used as error target
});

export type PartyFormData = z.infer<typeof partySchema>;
