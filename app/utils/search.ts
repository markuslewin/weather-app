import z from "zod";

export const searchResultSchema = z.object({
  items: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      latitude: z.number(),
      longitude: z.number(),
    })
  ),
});

export type SearchResult = z.infer<typeof searchResultSchema>;
export type SearchResultItem = SearchResult["items"][number];
