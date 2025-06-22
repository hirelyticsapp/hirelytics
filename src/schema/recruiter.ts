import { z } from 'zod';

export const createPortalAccessRequestSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  work_email: z.string().email('Please enter a valid work email address'),
  job_title: z.string().min(2, 'Job title is required'),
  phone_number: z.string().min(10, 'Please enter a valid phone number'),
  company_name: z.string().min(2, 'Company name is required'),
  company_size: z.string().min(1, 'Please select company size'),
  industry: z.string().min(1, 'Please select your industry'),
  monthly_hires: z.string().min(1, 'Please select estimated monthly hires'),
  hiring_challenge: z.string().min(20, 'Please provide more details (minimum 20 characters)'),
  referral_source: z.string().optional(),
});
