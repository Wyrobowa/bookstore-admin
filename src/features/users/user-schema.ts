import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  email: z.email('Please provide a valid email address.'),
  password: z.string().min(8, 'Password must have at least 8 characters.'),
  role_id: z.number().int().positive('Role ID must be a positive number.'),
  status_id: z.number().int().positive('Status ID must be a positive number.'),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
