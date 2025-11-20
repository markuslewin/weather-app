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
  readFixtureSettings,
} from "#tests/mocks/utils";
// import reverseGeocodeData from "#tests/fixtures/azure/reverse-geocoding/stockholm.json";

const createMockFixtureHandler = (
  predicate: string,
  dir: string,
  defaultData: JsonBodyType
) => {
  return http.get(predicate, async () => {
    const settings = await readFixtureSettings(dir);
    if (settings === null) {
      return HttpResponse.json(defaultData);
    }
    switch (settings.type) {
      case "error":
        return HttpResponse.error();
      case "json":
        return HttpResponse.json(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          await readFixture(dir, settings.fixture)
        );
    }
  });
};

export const handlers = [
  createMockFixtureHandler(
    "https://api.open-meteo.com/v1/forecast",
    meteoForecastDir,
    forecastData
  ),
  createMockFixtureHandler(
    "https://geocoding-api.open-meteo.com/v1/search",
    meteoSearchDir,
    searchData
  ),
  createMockFixtureHandler(
    "https://atlas.microsoft.com/reverseGeocode",
    azureReverseGeocodingDir,
    reverseGeocodeData
  ),
];
