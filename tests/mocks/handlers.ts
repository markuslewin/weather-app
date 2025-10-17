import { http, HttpResponse } from "msw";
// import data from "../fixtures/meteo/real.json";
import data from "../fixtures/meteo/figma.json";

export const handlers = [
  http.get("https://api.open-meteo.com/v1/forecast", () => {
    return HttpResponse.json(data);
  }),
];
