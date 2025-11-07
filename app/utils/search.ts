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

export const search = async (name: string) => {
  if (!name.trim()) {
    return { items: [] };
  }

  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?${new URLSearchParams({ name })}`
  );
  const parsed = z
    .object({
      results: z
        .array(
          z.object({
            id: z.number(),
            name: z.string(),
            latitude: z.number(),
            longitude: z.number(),
          })
        )
        .optional(),
    })
    .parse(await response.json());

  return {
    items: parsed.results ?? [],
  };
};
