import { z } from 'zod';

export const userSchema = z.object({
    fullname: z.string().optional(),
    phone: z.string().optional(),
    userid: z.string().optional(),
    address: z.string().optional(),
    title: z.string(),
    belongsto: z.string(),
    role: z.string(),
});

export type UserFormData = z.infer<typeof userSchema>;
export default userSchema