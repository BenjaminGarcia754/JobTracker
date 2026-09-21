import { z } from 'zod';

const fields = {
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).nullable(),
  price_cents: z.number().int().min(0).max(2_147_483_647),
  stock: z.number().int().min(0).max(2_147_483_647),
};
export const createProductSchema = z.strictObject({ ...fields, description: fields.description.default(null), stock: fields.stock.default(0) });
export const updateProductSchema = z.strictObject(fields).partial().refine((body) => Object.keys(body).length > 0, 'Provide at least one field');
export const productParamsSchema = z.strictObject({ id: z.uuid() });
const positiveInteger = z.string().regex(/^[1-9]\d*$/).transform(Number).pipe(z.number().int().max(2_147_483_647));
export const listProductsSchema = z.strictObject({
  page: positiveInteger.default(1),
  per_page: positiveInteger.pipe(z.number().max(100)).default(20),
});
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ListProductsInput = z.infer<typeof listProductsSchema>;
export type ProductParams = z.infer<typeof productParamsSchema>;
