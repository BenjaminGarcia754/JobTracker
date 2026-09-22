import { z } from 'zod';

const positiveInteger = z.string().regex(/^[1-9]\d*$/).transform(Number).pipe(z.number().int().max(2_147_483_647));

const fields = {
  company: z.string().trim().min(2).max(150),
  position: z.string().trim().max(150).min(1),
  url: z.url().max(500).nullable(),
  status: z.string().min(1).max(30).trim(),
  modality: z.string().min(1).max(30).trim().nullable(),
  location: z.string().trim().min(1).max(150).nullable(),
  salaryMin: z.number().min(.1).nullable(),
  salaryMax: z.number().min(.1).nullable(),
  currency: z.string().trim().toUpperCase().length(3).nullable(),
  appliedAt: z.coerce.date().nullable(),
  notes: z.string().trim().min(1).max(1000).nullable(),
};

export const createApplicationSchema = z.strictObject({ ...fields, status: fields.status.default('APPLIED') });
export const updateApplicationSchema = z.strictObject(fields).partial().refine((body) => Object.keys(body).length > 0, 'Provide at least one field');
export const applicationParamsSchema = z.strictObject({ id: positiveInteger });
export const listApplicationsSchema = z.strictObject({
  page: positiveInteger.default(1),
  per_page: positiveInteger.pipe(z.number().max(100)).default(20),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;
export type ListApplicationsInput = z.infer<typeof listApplicationsSchema>;
export type ApplicationParams = z.infer<typeof applicationParamsSchema>;
