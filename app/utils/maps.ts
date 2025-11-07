import { maps } from "#app/utils/maps-client.server";

export const getLocation = async ({
  latitude,
  longitude,
}: {
  latitude: string;
  longitude: string;
}) => {
  const response = await maps.path("/reverseGeocode").get({
    queryParameters: {
      coordinates: [Number(longitude), Number(latitude)],
    },
  });
  if (!("features" in response.body)) {
    throw new Error("Reverse geocoding failed", {
      cause: response.body,
    });
  }

  const feature = response.body.features?.[0];
  if (feature === undefined) {
    return null;
  }

  const locality = feature.properties?.address?.locality ?? null;
  const country = feature.properties?.address?.countryRegion?.name ?? null;

  return {
    locality,
    country,
  };
};
