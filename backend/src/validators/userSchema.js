import { z } from 'zod';

export const userSignUpSchema = z.object({
  userName: z.string().min(3),
  email: z.string().email(),
  password: z.string()
});

export const userSignInSchema = z.object({
  email: z.string().email(),
  password: z.string()
});
