import { Icon } from "#app/components/icon";
import { Location } from "#app/components/location";
import { RetryButton } from "#app/components/retry-button";
import { SearchLayout } from "#app/components/search-layout";
import { getLocation } from "#app/utils/maps";
import { search } from "#app/utils/search";
import { createHomeUrl, homeSearchParamsSchema } from "#app/utils/url";
import { getWeather } from "#app/utils/weather";
import { useEffect } from "react";
import { redirect, type LoaderFunctionArgs } from "react-router";
import type { Route } from "./+types/home";

export async function loader({ request }: LoaderFunctionArgs) {
  const searchParamsResult = homeSearchParamsSchema.safeParse(
    Object.fromEntries(new URL(request.url).searchParams)
  );
  if (!searchParamsResult.success) {
    return { type: "initial" } as const;
  }

  const searchParams = searchParamsResult.data;
  if ("q" in searchParams) {
    const {
      items: [match],
    } = await search(searchParams.q);
    if (match === undefined) {
      return { type: "empty" } as const;
    }
    return redirect(
      createHomeUrl({
        lat: match.latitude.toString(),
        lon: match.longitude.toString(),
      })
    );
  }

  const location = getLocation({
    latitude: searchParams.lat,
    longitude: searchParams.lon,
  }).catch((err) => {
    console.error("[Streamed error]", err);
    throw err;
  });
  const weather = getWeather({
    latitude: searchParams.lat,
    longitude: searchParams.lon,
  }).catch((err) => {
    console.error("[Streamed error]", err);
    throw err;
  });
  return { type: "location", data: { location, weather } } as const;
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <SearchLayout>
      {loaderData.type === "empty" ? (
        <h2 className="[ empty ] [ mt-600 ]">No search result found!</h2>
      ) : loaderData.type === "location" ? (
        <Location
          location={loaderData.data.location}
          weather={loaderData.data.weather}
        />
      ) : null}
    </SearchLayout>
  );
}

export const ErrorBoundary = ({ error }: Route.ErrorBoundaryProps) => {
  useEffect(() => {
    console.error(error);
  }, [error]);

  // todo: Check that it's an actual API error
  return (
    <div className="error">
      <Icon name="IconError" width={18} height={18} />
      <h1 className="mt-300 text-preset-2">Something went wrong</h1>
      <p className="[ error__message ] [ mt-300 ]">
        We couldn’t connect to the server (API error). Please try again in a few
        moments.
      </p>
      <RetryButton />
    </div>
  );
};
