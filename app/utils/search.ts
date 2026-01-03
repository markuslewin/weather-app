import * as z from "zod";

export const searchResultSchema = z.object({
  items: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      latitude: z.number(),
      longitude: z.number(),
      admin1: z.string().optional(),
    })
  ),
});
export type SearchResult = z.infer<typeof searchResultSchema>;
export type SearchResultItem = SearchResult["items"][number];

const searchResponseItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  admin1: z.string().optional(),
});
const searchResponseSchema = z.object({
  results: z.array(searchResponseItemSchema).optional(),
});
export type SearchResponseItem = z.infer<typeof searchResponseItemSchema>;
export type SearchResponse = z.infer<typeof searchResponseSchema>;

export const search = async (name: string) => {
  if (!name.trim()) {
    return { items: [] };
  }

  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?${new URLSearchParams({ name })}`
  );
  const parsed = searchResponseSchema.parse(await response.json());

  return {
    items: parsed.results ?? [],
  };
};
