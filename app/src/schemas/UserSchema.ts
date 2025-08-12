import { z } from 'zod';

export const userSchema = z.object({
    selectedValue: z.string().optional(),
    fullname: z.string().optional(),
    phone: z.string().optional(),
    userid: z.string().optional(),
    address: z.string().optional(),
    title: z.string(),
    belongsto: z.string(),
    role: z.string(),
});

export const chooseAdminSchema = (isRequired: boolean) =>
    z.object({
        fullname: isRequired
            ? z.string().nonempty('Please select a new admin')
            : z.string().optional().nullable(),
    });

export type UserFormData = z.infer<typeof userSchema>;
export type ChooseAdminFormData = z.infer<ReturnType<typeof chooseAdminSchema>>;
export default userSchema