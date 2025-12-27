import * as z from "zod";

export const homeSearchParamsSchema = z.union([
  z.object({
    q: z.string(),
  }),
  z.object({
    lon: z.string(),
    lat: z.string(),
  }),
]);
type HomeSearchParams = z.infer<typeof homeSearchParamsSchema>;

export const createHomeUrl = (search?: HomeSearchParams) => {
  return `/${search === undefined ? "" : "?"}${new URLSearchParams(search)}`;
};
