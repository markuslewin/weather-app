import { http, HttpResponse } from "msw";
// import forecastData from "#tests/fixtures/meteo/forecast/real.json";
import forecastData from "#tests/fixtures/meteo/forecast/figma.json";
import searchData from "#tests/fixtures/meteo/search/real.json";
// import searchData from "#tests/fixtures/meteo/search/empty.json";

export const handlers = [
  http.get("https://api.open-meteo.com/v1/forecast", () => {
    return HttpResponse.json(forecastData);
  }),
  http.get("https://geocoding-api.open-meteo.com/v1/search", () => {
    return HttpResponse.json(searchData);
  }),
];
