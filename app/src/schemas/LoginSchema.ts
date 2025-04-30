import { z } from 'zod';

export const loginSchema = z.object({
  userid: z
    .string()
    .min(1, " Enter ITS number"),
  userpass: z
    .string()
    .min(1, " Enter password"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export default loginSchema