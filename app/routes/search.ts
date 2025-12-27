import { search, type SearchResult } from "#app/utils/search";
import type { LoaderFunctionArgs } from "react-router";
import * as z from "zod";

export const loader = async ({
  request,
}: LoaderFunctionArgs): Promise<SearchResult> => {
  const { name } = z
    .object({
      name: z.string(),
    })
    .parse(Object.fromEntries(new URL(request.url).searchParams));

  return await search(name);
};
