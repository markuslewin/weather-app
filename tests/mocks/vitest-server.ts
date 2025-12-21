import reverseGeocodeData from "#tests/fixtures/azure/reverse-geocoding/berlin.json";
import forecastData from "#tests/fixtures/meteo/forecast/figma.json";
import searchData from "#tests/fixtures/meteo/search/real.json";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

const handlers = [
  http.get("https://api.open-meteo.com/v1/forecast", () => {
    return HttpResponse.json(forecastData);
  }),
  http.get("https://geocoding-api.open-meteo.com/v1/search", () => {
    return HttpResponse.json(searchData);
  }),
  http.get("https://atlas.microsoft.com/reverseGeocode", () => {
    return HttpResponse.json(reverseGeocodeData);
  }),
  http.post<{ tenantId: string }>(
    "https://login.microsoftonline.com/:tenantId/oauth2/v2.0/token",
    () => {
      return HttpResponse.json(
        {
          token_type: "Bearer",
          expires_in: 3599,
          ext_expires_in: 3599,
          access_token: "mock_access_token",
        },
        { status: 200 },
      );
    },
  ),
];

export const server = setupServer(...handlers);
