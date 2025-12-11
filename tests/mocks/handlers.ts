import forecastData from "#tests/fixtures/meteo/forecast/figma.json";
import searchData from "#tests/fixtures/meteo/search/real.json";
import { http, HttpResponse, type JsonBodyType } from "msw";
// import searchData from "#tests/fixtures/meteo/search/empty.json";
import reverseGeocodeData from "#tests/fixtures/azure/reverse-geocoding/berlin.json";
import {
  azureReverseGeocodingDir,
  meteoForecastDir,
  meteoSearchDir,
  readFixture,
} from "#tests/mocks/utils";
// import reverseGeocodeData from "#tests/fixtures/azure/reverse-geocoding/stockholm.json";

const getFixture = async (dir: string, defaultData: JsonBodyType) => {
  const fixture = await readFixture(dir);
  if (fixture === null) {
    return HttpResponse.json(defaultData);
  }
  return HttpResponse.json(fixture.body, fixture.init);
};

export const handlers = [
  http.get("https://api.open-meteo.com/v1/forecast", async () => {
    // await setTimeout(4000);
    return getFixture(meteoForecastDir, forecastData);
  }),
  http.get("https://geocoding-api.open-meteo.com/v1/search", async () => {
    return getFixture(meteoSearchDir, searchData);
  }),
  http.get("https://atlas.microsoft.com/reverseGeocode", async () => {
    // Important to satisfy response outputs since the clients don't parse run-time response data
    // return HttpResponse.json({} satisfies ErrorResponseOutput, {
    //   status: 500,
    // });
    return getFixture(azureReverseGeocodingDir, reverseGeocodeData);
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
