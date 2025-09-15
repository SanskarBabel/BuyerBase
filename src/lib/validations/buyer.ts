import { z } from 'zod';

export const citySchema = z.enum(['Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other']);
export const propertyTypeSchema = z.enum(['Apartment', 'Villa', 'Plot', 'Office', 'Retail']);
export const bhkSchema = z.enum(['1', '2', '3', '4', 'Studio']);
export const purposeSchema = z.enum(['Buy', 'Rent']);
export const timelineSchema = z.enum(['0-3m', '3-6m', '>6m', 'Exploring']);
export const sourceSchema = z.enum(['Website', 'Referral', 'Walk-in', 'Call', 'Other']);
export const statusSchema = z.enum(['New', 'Qualified', 'Contacted', 'Visited', 'Negotiation', 'Converted', 'Dropped']);

export const phoneRegex = /^\d{10,15}$/;
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const createBuyerSchema = z.object({
  fullName: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(80, 'Full name must not exceed 80 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Full name can only contain letters and spaces'),
  email: z.string()
    .email('Invalid email format')
    .optional()
    .or(z.literal('')),
  phone: z.string()
    .regex(phoneRegex, 'Phone number must be 10-15 digits'),
  city: citySchema,
  propertyType: propertyTypeSchema,
  bhk: bhkSchema.optional(),
  purpose: purposeSchema,
  budgetMin: z.number()
    .int('Budget must be a whole number')
    .positive('Budget must be positive')
    .optional(),
  budgetMax: z.number()
    .int('Budget must be a whole number')
    .positive('Budget must be positive')
    .optional(),
  timeline: timelineSchema,
  source: sourceSchema,
  status: statusSchema.default('New'),
  notes: z.string()
    .max(1000, 'Notes must not exceed 1000 characters')
    .optional(),
  tags: z.array(z.string()).default([]),
}).refine((data) => {
  // BHK is required for Apartment and Villa
  if (['Apartment', 'Villa'].includes(data.propertyType) && !data.bhk) {
    return false;
  }
  return true;
}, {
  message: 'BHK is required for Apartment and Villa property types',
  path: ['bhk'],
}).refine((data) => {
  // Budget max should be >= budget min
  if (data.budgetMin && data.budgetMax && data.budgetMax < data.budgetMin) {
    return false;
  }
  return true;
}, {
  message: 'Maximum budget must be greater than or equal to minimum budget',
  path: ['budgetMax'],
});

export const updateBuyerSchema = createBuyerSchema.partial();

export const buyerFiltersSchema = z.object({
  page: z.number().int().positive().default(1),
  search: z.string().optional(),
  city: citySchema.optional(),
  propertyType: propertyTypeSchema.optional(),
  status: statusSchema.optional(),
  timeline: timelineSchema.optional(),
  sortBy: z.enum(['fullName', 'phone', 'city', 'propertyType', 'status', 'updatedAt']).default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateBuyerData = z.infer<typeof createBuyerSchema>;
export type UpdateBuyerData = z.infer<typeof updateBuyerSchema>;
export type BuyerFilters = z.infer<typeof buyerFiltersSchema>;