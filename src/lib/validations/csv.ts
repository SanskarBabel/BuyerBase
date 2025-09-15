import { z } from 'zod';
import { createBuyerSchema } from './buyer';

export const csvRowSchema = createBuyerSchema.extend({
  fullName: z.string().min(1, 'Full name is required'),
  phone: z.string().min(1, 'Phone is required'),
  city: z.string().min(1, 'City is required'),
  propertyType: z.string().min(1, 'Property type is required'),
  purpose: z.string().min(1, 'Purpose is required'),
  timeline: z.string().min(1, 'Timeline is required'),
  source: z.string().min(1, 'Source is required'),
});

export const csvImportSchema = z.object({
  data: z.array(csvRowSchema).max(200, 'Cannot import more than 200 rows at once'),
});

export type CSVRow = z.infer<typeof csvRowSchema>;
export type CSVImportData = z.infer<typeof csvImportSchema>;