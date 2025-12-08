import { z } from 'zod';

/**
 * Zod validation schema for Button
 */
export const ButtonSchema = z.object({
  label: z.string(),
  variant: z.enum(['primary', 'secondary', 'danger', 'success', 'warning', 'info']).optional().default('primary'),
  size: z.enum(['small', 'medium', 'large']).optional().default('medium'),
  disabled: z.boolean().optional().default(false),
  onClick: z.function().optional(),
});

export type ButtonData = z.infer<typeof ButtonSchema>;
