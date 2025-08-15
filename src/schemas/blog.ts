import { z } from 'zod';

export const blogSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  content: z.string().min(1),
  image: z.string().url('Please upload a valid image'),
});
