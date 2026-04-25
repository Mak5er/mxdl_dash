import { z } from "zod";

const pageSizeSchema = z.coerce.number().int().min(1).max(100).catch(25);
const dateParamSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .optional()
  .catch(undefined);
export const userSortFields = [
  "userId",
  "name",
  "username",
  "chatType",
  "language",
  "status",
  "settings",
  "events",
  "lastActivity",
] as const;

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).catch(1),
  pageSize: pageSizeSchema,
});

export const loginSchema = z.object({
  token: z.string().min(1).max(512),
});

export const sendMessageSchema = z.object({
  userId: z.coerce.number().int().positive(),
  message: z.string().trim().min(1).max(1500),
});

export const usersFilterSchema = paginationSchema.extend({
  search: z.string().trim().max(120).optional().catch(undefined),
  chatType: z.string().trim().max(80).optional().catch(undefined),
  language: z.string().trim().max(40).optional().catch(undefined),
  status: z.string().trim().max(80).optional().catch(undefined),
  sort: z.enum(userSortFields).catch("lastActivity"),
  direction: z.enum(["asc", "desc"]).catch("desc"),
});

export const downloadsFilterSchema = paginationSchema.extend({
  search: z.string().trim().max(240).optional().catch(undefined),
  fileType: z.string().trim().max(120).optional().catch(undefined),
  from: dateParamSchema,
  to: dateParamSchema,
});

export const eventsFilterSchema = paginationSchema.extend({
  userId: z.coerce.number().int().positive().optional().catch(undefined),
  actionName: z.string().trim().max(160).optional().catch(undefined),
  chatType: z.string().trim().max(80).optional().catch(undefined),
  from: dateParamSchema,
  to: dateParamSchema,
});

export function coerceSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
) {
  return Object.fromEntries(
    Object.entries(searchParams).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  );
}
