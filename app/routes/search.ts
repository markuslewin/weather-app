import type { SearchResult } from "#app/utils/search";
import type { LoaderFunctionArgs } from "react-router";
import z from "zod";

const searchResponseSchema = z.object({
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
});

export const loader = async ({
  request,
}: LoaderFunctionArgs): Promise<SearchResult> => {
  const name = new URL(request.url).searchParams.get("name")?.trim();
  if (!name) {
    return { items: [] };
  }

  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?${new URLSearchParams({ name })}`
  );
  const json = await response.json();
  const parsed = searchResponseSchema.parse(json);
  return {
    items: parsed.results ?? [],
  };
};
