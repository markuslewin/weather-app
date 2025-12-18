import {
  createWeather,
  getWeather,
  type WeatherResponse,
} from "#app/utils/weather";
import { server } from "#tests/mocks/node";
import { http, HttpResponse } from "msw";
import { expect, test } from "vitest";

test("returns days", async () => {
  server.use(
    http.get("https://api.open-meteo.com/v1/forecast", () => {
      return HttpResponse.json(
        createWeather({
          timezone: "Asia/Shanghai",
          utc_offset_seconds: 8 * 60 * 60,
          current: {
            time: new Date("2025-12-17T00:00+08:00").getTime() / 1000,
          },
          daily: {
            time: [
              new Date("2025-12-17T00:00+08:00").getTime() / 1000,
              new Date("2025-12-18T00:00+08:00").getTime() / 1000,
              new Date("2025-12-19T00:00+08:00").getTime() / 1000,
              new Date("2025-12-20T00:00+08:00").getTime() / 1000,
              new Date("2025-12-21T00:00+08:00").getTime() / 1000,
              new Date("2025-12-22T00:00+08:00").getTime() / 1000,
              new Date("2025-12-23T00:00+08:00").getTime() / 1000,
            ],
          },
        }) satisfies WeatherResponse,
      );
    }),
  );

  await expect(
    getWeather({ latitude: "0", longitude: "0" }),
  ).resolves.toMatchObject({
    daily: [
      { time: new Date("2025-12-17T00:00+08:00") },
      { time: new Date("2025-12-18T00:00+08:00") },
      { time: new Date("2025-12-19T00:00+08:00") },
      { time: new Date("2025-12-20T00:00+08:00") },
      { time: new Date("2025-12-21T00:00+08:00") },
      { time: new Date("2025-12-22T00:00+08:00") },
      { time: new Date("2025-12-23T00:00+08:00") },
    ],
  });
});

test("handles entering dst for daily", async () => {
  server.use(
    http.get("https://api.open-meteo.com/v1/forecast", () => {
      return HttpResponse.json(
        createWeather({
          timezone: "Europe/Stockholm",
          current: {
            time: new Date("2025-03-28T12:00+01:00").getTime() / 1000,
          },
          utc_offset_seconds: 1 * 60 * 60,
          daily: {
            time: [
              new Date("2025-03-28T00:00+01:00").getTime() / 1000,
              new Date("2025-03-29T00:00+01:00").getTime() / 1000,
              new Date("2025-03-30T00:00+01:00").getTime() / 1000,
              // Entering DST, but offsets incorrectly stay the same
              new Date("2025-03-31T00:00+01:00").getTime() / 1000,
              new Date("2025-04-01T00:00+01:00").getTime() / 1000,
              new Date("2025-04-02T00:00+01:00").getTime() / 1000,
              new Date("2025-04-03T00:00+01:00").getTime() / 1000,
            ],
          },
        }) satisfies WeatherResponse,
      );
    }),
  );

  await expect(
    getWeather({ latitude: "0", longitude: "0" }),
  ).resolves.toMatchObject({
    daily: [
      {
        time: new Date("2025-03-28T00:00+01:00"),
      },
      {
        time: new Date("2025-03-29T00:00+01:00"),
      },
      {
        time: new Date("2025-03-30T00:00+01:00"),
      },
      {
        time: new Date("2025-03-31T00:00+02:00"),
      },
      {
        time: new Date("2025-04-01T00:00+02:00"),
      },
      {
        time: new Date("2025-04-02T00:00+02:00"),
      },
      {
        time: new Date("2025-04-03T00:00+02:00"),
      },
    ],
  });
});

// https://github.com/open-meteo/open-meteo/issues/488#issue-1965824597
test("handles exiting dst for daily", async () => {
  server.use(
    http.get("https://api.open-meteo.com/v1/forecast", () => {
      return HttpResponse.json(
        createWeather({
          timezone: "Europe/Tallinn",
          utc_offset_seconds: 3 * 60 * 60,
          current: {
            time: 1698354000,
          },
          daily: {
            time: [
              1698354000, 1698440400, 1698526800,
              // Exiting DST
              // The following timestamps reference the wrong point in time
              1698613200, 1698699600, 1698786000, 1698872400,
            ],
          },
        }) satisfies WeatherResponse,
      );
    }),
  );

  await expect(
    getWeather({ latitude: "0", longitude: "0" }),
  ).resolves.toMatchObject({
    daily: [
      {
        time: new Date("2023-10-27T00:00+03:00"),
      },
      {
        time: new Date("2023-10-28T00:00+03:00"),
      },
      {
        time: new Date("2023-10-29T00:00+03:00"),
      },
      {
        time: new Date("2023-10-30T00:00+02:00"),
      },
      {
        time: new Date("2023-10-31T00:00+02:00"),
      },
      {
        time: new Date("2023-11-01T00:00+02:00"),
      },
      {
        time: new Date("2023-11-02T00:00+02:00"),
      },
    ],
  });
});

test("returns hours", async () => {
  server.use(
    http.get("https://api.open-meteo.com/v1/forecast", () => {
      return HttpResponse.json(
        createWeather({
          timezone: "Africa/Johannesburg",
          utc_offset_seconds: 2 * 60 * 60,
          current: {
            time: new Date("2025-12-18T13:00+02:00").getTime() / 1000,
          },
          hourly: {
            time: [
              new Date("2025-12-18T00:00+02:00").getTime() / 1000,
              new Date("2025-12-18T01:00+02:00").getTime() / 1000,
              new Date("2025-12-19T00:00+02:00").getTime() / 1000,
              new Date("2025-12-19T23:00+02:00").getTime() / 1000,
              new Date("2025-12-20T00:00+02:00").getTime() / 1000,
              new Date("2025-12-21T00:00+02:00").getTime() / 1000,
              new Date("2025-12-22T00:00+02:00").getTime() / 1000,
              new Date("2025-12-23T00:00+02:00").getTime() / 1000,
              new Date("2025-12-24T00:00+02:00").getTime() / 1000,
              new Date("2025-12-24T23:00+02:00").getTime() / 1000,
            ],
          },
        }) satisfies WeatherResponse,
      );
    }),
  );

  await expect(
    getWeather({ latitude: "0", longitude: "0" }),
  ).resolves.toMatchObject({
    hourly: [
      { time: new Date("2025-12-18T00:00+02:00") },
      { time: new Date("2025-12-18T01:00+02:00") },
      { time: new Date("2025-12-19T00:00+02:00") },
      { time: new Date("2025-12-19T23:00+02:00") },
      { time: new Date("2025-12-20T00:00+02:00") },
      { time: new Date("2025-12-21T00:00+02:00") },
      { time: new Date("2025-12-22T00:00+02:00") },
      { time: new Date("2025-12-23T00:00+02:00") },
      { time: new Date("2025-12-24T00:00+02:00") },
      { time: new Date("2025-12-24T23:00+02:00") },
    ],
  });
});

test("limits forecast to 1 week", async () => {
  server.use(
    http.get("https://api.open-meteo.com/v1/forecast", () => {
      return HttpResponse.json(
        createWeather({
          timezone: "Africa/Johannesburg",
          utc_offset_seconds: 2 * 60 * 60,
          current: {
            time: new Date("2025-12-18T13:00+02:00").getTime() / 1000,
          },
          daily: {
            time: [
              new Date("2025-12-18T00:00+02:00").getTime() / 1000,
              new Date("2025-12-19T00:00+02:00").getTime() / 1000,
              new Date("2025-12-20T00:00+02:00").getTime() / 1000,
              new Date("2025-12-21T00:00+02:00").getTime() / 1000,
              new Date("2025-12-22T00:00+02:00").getTime() / 1000,
              new Date("2025-12-23T00:00+02:00").getTime() / 1000,
              new Date("2025-12-24T00:00+02:00").getTime() / 1000,
              new Date("2025-12-25T00:00+02:00").getTime() / 1000,
            ],
          },
          hourly: {
            time: [
              new Date("2025-12-18T00:00+02:00").getTime() / 1000,
              new Date("2025-12-19T00:00+02:00").getTime() / 1000,
              new Date("2025-12-20T00:00+02:00").getTime() / 1000,
              new Date("2025-12-21T00:00+02:00").getTime() / 1000,
              new Date("2025-12-22T00:00+02:00").getTime() / 1000,
              new Date("2025-12-23T00:00+02:00").getTime() / 1000,
              new Date("2025-12-24T00:00+02:00").getTime() / 1000,
              new Date("2025-12-24T23:00+02:00").getTime() / 1000,
              new Date("2025-12-25T00:00+02:00").getTime() / 1000,
            ],
          },
        }) satisfies WeatherResponse,
      );
    }),
  );

  await expect(
    getWeather({ latitude: "0", longitude: "0" }),
  ).resolves.toMatchObject({
    daily: [
      { time: new Date("2025-12-18T00:00+02:00") },
      { time: new Date("2025-12-19T00:00+02:00") },
      { time: new Date("2025-12-20T00:00+02:00") },
      { time: new Date("2025-12-21T00:00+02:00") },
      { time: new Date("2025-12-22T00:00+02:00") },
      { time: new Date("2025-12-23T00:00+02:00") },
      { time: new Date("2025-12-24T00:00+02:00") },
      // { time: new Date("2025-12-25T00:00+02:00") },
    ],
    hourly: [
      { time: new Date("2025-12-18T00:00+02:00") },
      { time: new Date("2025-12-19T00:00+02:00") },
      { time: new Date("2025-12-20T00:00+02:00") },
      { time: new Date("2025-12-21T00:00+02:00") },
      { time: new Date("2025-12-22T00:00+02:00") },
      { time: new Date("2025-12-23T00:00+02:00") },
      { time: new Date("2025-12-24T00:00+02:00") },
      { time: new Date("2025-12-24T23:00+02:00") },
      // { time: new Date("2025-12-25T00:00+02:00") },
    ],
  });
});
