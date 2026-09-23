import z from 'zod';

const positiveInteger = z.string().regex(/^[1-9]\d*$/).transform(Number).pipe(z.number().int().max(2_147_483_647));

const fields = {
    name: z.string().trim().min(1).max(80),
}

export const createTechnologySchema = z.strictObject(fields);
export const updateTechnologySchema = z.strictObject(fields).partial().refine((body) => Object.keys(body).length > 0, 'Provide at least one field');
export const technologyParamsSchema = z.strictObject({ id: positiveInteger });
export const listTechnologiesSchema = z.strictObject({
    page: positiveInteger.default(1),
    per_page: positiveInteger.pipe(z.number().max(100)).default(20),
});

export type CreateTechnologyInput = z.infer<typeof createTechnologySchema>;
export type UpdateTechnologyInput = z.infer<typeof updateTechnologySchema>;
export type ListTechnologiesInput = z.infer<typeof listTechnologiesSchema>;
export type TechnologyParams = z.infer<typeof technologyParamsSchema>;