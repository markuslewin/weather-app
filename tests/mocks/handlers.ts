import { http, HttpResponse } from "msw";
import forecastData from "#tests/fixtures/meteo/forecast/figma.json";
import searchData from "#tests/fixtures/meteo/search/real.json";
// import searchData from "#tests/fixtures/meteo/search/empty.json";
import reverseGeocodeData from "#tests/fixtures/azure/reverse-geocoding/berlin.json";
import {
  meteoForecastDir,
  readFixture,
  readFixtureSettings,
} from "#tests/mocks/utils";
// import reverseGeocodeData from "#tests/fixtures/azure/reverse-geocoding/stockholm.json";

export const handlers = [
  http.get("https://api.open-meteo.com/v1/forecast", async () => {
    const settings = await readFixtureSettings(meteoForecastDir);
    if (settings === null) {
      return HttpResponse.json(forecastData);
    }
    switch (settings.type) {
      case "error":
        return HttpResponse.error();
      case "json":
        return HttpResponse.json(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          await readFixture(meteoForecastDir, settings.fixture)
        );
    }
  }),
  http.get("https://geocoding-api.open-meteo.com/v1/search", () => {
    return HttpResponse.json(searchData);
  }),
  http.get("https://atlas.microsoft.com/reverseGeocode", () => {
    return HttpResponse.json(reverseGeocodeData);
  }),
];
