import type { LoaderFunctionArgs } from "react-router";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const name = new URL(request.url).searchParams.get("name")?.trim();
  if (!name) {
    return Response.json({ results: [] });
  }
  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${name}`
  );
  const json = await response.json();
  return Response.json(json);
};
