import { z } from 'zod';

export const signupSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  dob: z.object({
    month: z.string(),
    year: z.string(),
  }),
  gender: z.enum(['Male', 'Female', 'Other']),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  address: z.string().min(1, 'Address is required'),
  profileImage: z.string().nullable().refine(val => !!val, {
    message: 'Profile image is required',
  }),
});