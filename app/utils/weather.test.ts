import {
  createCurrentTime,
  createDaily,
  createHourly,
  createWeather,
  dailySchema,
  getWeather,
  hourlySchema,
  type Daily,
  type Hourly,
  type WeatherResponse,
} from "#app/utils/weather";
import { server } from "#tests/mocks/vitest-server";
import { TZDate } from "@date-fns/tz";
import { secondsToMilliseconds } from "date-fns";
import { http, HttpResponse } from "msw";
import { expect, test } from "vitest";

test("returns days", async () => {
  const currentTime = createCurrentTime(
    new TZDate(2025, 11, 17, "Asia/Shanghai")
  );
  const time = [
    new Date("2025-12-17T00:00+08:00").getTime() / 1000,
    new Date("2025-12-18T00:00+08:00").getTime() / 1000,
    new Date("2025-12-19T00:00+08:00").getTime() / 1000,
    new Date("2025-12-20T00:00+08:00").getTime() / 1000,
    new Date("2025-12-21T00:00+08:00").getTime() / 1000,
    new Date("2025-12-22T00:00+08:00").getTime() / 1000,
    new Date("2025-12-23T00:00+08:00").getTime() / 1000,
  ];

  server.use(
    http.get("https://api.open-meteo.com/v1/forecast", () => {
      return HttpResponse.json(
        createWeather({
          timezone: currentTime.timezone,
          utc_offset_seconds: currentTime.utc_offset_seconds,
          current: {
            time: currentTime.time,
          },
          daily: createDaily({ time }),
        }) satisfies WeatherResponse
      );
    })
  );

  await expect(
    getWeather({ latitude: "0", longitude: "0" })
  ).resolves.toMatchObject({
    daily: [
      { time: new Date("2025-12-17T00:00+08:00").getTime() },
      { time: new Date("2025-12-18T00:00+08:00").getTime() },
      { time: new Date("2025-12-19T00:00+08:00").getTime() },
      { time: new Date("2025-12-20T00:00+08:00").getTime() },
      { time: new Date("2025-12-21T00:00+08:00").getTime() },
      { time: new Date("2025-12-22T00:00+08:00").getTime() },
      { time: new Date("2025-12-23T00:00+08:00").getTime() },
    ],
  });
});

test("handles entering dst for daily", async () => {
  const currentTime = createCurrentTime(
    new TZDate(2025, 2, 28, 12, "Europe/Stockholm")
  );
  const time = [
    new Date("2025-03-28T00:00+01:00").getTime() / 1000,
    new Date("2025-03-29T00:00+01:00").getTime() / 1000,
    new Date("2025-03-30T00:00+01:00").getTime() / 1000,
    // Entering DST, but offsets incorrectly stay the same
    new Date("2025-03-31T00:00+01:00").getTime() / 1000,
    new Date("2025-04-01T00:00+01:00").getTime() / 1000,
    new Date("2025-04-02T00:00+01:00").getTime() / 1000,
    new Date("2025-04-03T00:00+01:00").getTime() / 1000,
  ];

  server.use(
    http.get("https://api.open-meteo.com/v1/forecast", () => {
      return HttpResponse.json(
        createWeather({
          timezone: currentTime.timezone,
          current: {
            time: currentTime.time,
          },
          utc_offset_seconds: currentTime.utc_offset_seconds,
          daily: createDaily({ time }),
        }) satisfies WeatherResponse
      );
    })
  );

  await expect(
    getWeather({ latitude: "0", longitude: "0" })
  ).resolves.toMatchObject({
    daily: [
      {
        time: new Date("2025-03-28T00:00+01:00").getTime(),
      },
      {
        time: new Date("2025-03-29T00:00+01:00").getTime(),
      },
      {
        time: new Date("2025-03-30T00:00+01:00").getTime(),
      },
      {
        time: new Date("2025-03-31T00:00+02:00").getTime(),
      },
      {
        time: new Date("2025-04-01T00:00+02:00").getTime(),
      },
      {
        time: new Date("2025-04-02T00:00+02:00").getTime(),
      },
      {
        time: new Date("2025-04-03T00:00+02:00").getTime(),
      },
    ],
  });
});

// https://github.com/open-meteo/open-meteo/issues/488#issue-1965824597
test("handles exiting dst for daily", async () => {
  const currentTime = createCurrentTime(
    new TZDate(secondsToMilliseconds(1698354000), "Europe/Tallinn")
  );
  const time = [
    1698354000, 1698440400, 1698526800,
    // Exiting DST
    // The following timestamps reference the wrong point in time
    1698613200, 1698699600, 1698786000, 1698872400,
  ];

  server.use(
    http.get("https://api.open-meteo.com/v1/forecast", () => {
      return HttpResponse.json(
        createWeather({
          timezone: currentTime.timezone,
          utc_offset_seconds: currentTime.utc_offset_seconds,
          current: {
            time: currentTime.time,
          },
          daily: createDaily({ time }),
        }) satisfies WeatherResponse
      );
    })
  );

  await expect(
    getWeather({ latitude: "0", longitude: "0" })
  ).resolves.toMatchObject({
    daily: [
      {
        time: new Date("2023-10-27T00:00+03:00").getTime(),
      },
      {
        time: new Date("2023-10-28T00:00+03:00").getTime(),
      },
      {
        time: new Date("2023-10-29T00:00+03:00").getTime(),
      },
      {
        time: new Date("2023-10-30T00:00+02:00").getTime(),
      },
      {
        time: new Date("2023-10-31T00:00+02:00").getTime(),
      },
      {
        time: new Date("2023-11-01T00:00+02:00").getTime(),
      },
      {
        time: new Date("2023-11-02T00:00+02:00").getTime(),
      },
    ],
  });
});

test("returns hours", async () => {
  const currentTime = createCurrentTime(
    new TZDate(2025, 11, 18, 13, "Africa/Johannesburg")
  );
  const time = [
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
  ];

  server.use(
    http.get("https://api.open-meteo.com/v1/forecast", () => {
      return HttpResponse.json(
        createWeather({
          timezone: currentTime.timezone,
          utc_offset_seconds: currentTime.utc_offset_seconds,
          current: {
            time: currentTime.time,
          },
          hourly: createHourly({ time }),
        }) satisfies WeatherResponse
      );
    })
  );

  await expect(
    getWeather({ latitude: "0", longitude: "0" })
  ).resolves.toMatchObject({
    hourly: [
      { time: new Date("2025-12-19T00:00+02:00").getTime() },
      { time: new Date("2025-12-19T23:00+02:00").getTime() },
      { time: new Date("2025-12-20T00:00+02:00").getTime() },
      { time: new Date("2025-12-21T00:00+02:00").getTime() },
      { time: new Date("2025-12-22T00:00+02:00").getTime() },
      { time: new Date("2025-12-23T00:00+02:00").getTime() },
      { time: new Date("2025-12-24T00:00+02:00").getTime() },
      { time: new Date("2025-12-24T23:00+02:00").getTime() },
    ],
  });
});

test("limits forecast to 1 week", async () => {
  const currentTime = createCurrentTime(
    new TZDate(2025, 11, 18, 13, "Africa/Johannesburg")
  );
  const dailyTime = [
    new Date("2025-12-18T00:00+02:00").getTime() / 1000,
    new Date("2025-12-19T00:00+02:00").getTime() / 1000,
    new Date("2025-12-20T00:00+02:00").getTime() / 1000,
    new Date("2025-12-21T00:00+02:00").getTime() / 1000,
    new Date("2025-12-22T00:00+02:00").getTime() / 1000,
    new Date("2025-12-23T00:00+02:00").getTime() / 1000,
    new Date("2025-12-24T00:00+02:00").getTime() / 1000,
    new Date("2025-12-25T00:00+02:00").getTime() / 1000,
  ];
  const hourlyTime = [
    new Date("2025-12-18T00:00+02:00").getTime() / 1000,
    new Date("2025-12-19T00:00+02:00").getTime() / 1000,
    new Date("2025-12-20T00:00+02:00").getTime() / 1000,
    new Date("2025-12-21T00:00+02:00").getTime() / 1000,
    new Date("2025-12-22T00:00+02:00").getTime() / 1000,
    new Date("2025-12-23T00:00+02:00").getTime() / 1000,
    new Date("2025-12-24T00:00+02:00").getTime() / 1000,
    new Date("2025-12-24T23:00+02:00").getTime() / 1000,
    new Date("2025-12-25T00:00+02:00").getTime() / 1000,
  ];

  server.use(
    http.get("https://api.open-meteo.com/v1/forecast", () => {
      return HttpResponse.json(
        createWeather({
          timezone: currentTime.timezone,
          utc_offset_seconds: currentTime.utc_offset_seconds,
          current: {
            time: currentTime.time,
          },
          daily: createDaily({ time: dailyTime }),
          hourly: createHourly({ time: hourlyTime }),
        }) satisfies WeatherResponse
      );
    })
  );

  await expect(
    getWeather({ latitude: "0", longitude: "0" })
  ).resolves.toMatchObject({
    daily: [
      { time: new Date("2025-12-18T00:00+02:00").getTime() },
      { time: new Date("2025-12-19T00:00+02:00").getTime() },
      { time: new Date("2025-12-20T00:00+02:00").getTime() },
      { time: new Date("2025-12-21T00:00+02:00").getTime() },
      { time: new Date("2025-12-22T00:00+02:00").getTime() },
      { time: new Date("2025-12-23T00:00+02:00").getTime() },
      { time: new Date("2025-12-24T00:00+02:00").getTime() },
      // { time: new Date("2025-12-25T00:00+02:00") },
    ],
    hourly: [
      // { time: new Date("2025-12-18T00:00+02:00") },
      { time: new Date("2025-12-19T00:00+02:00").getTime() },
      { time: new Date("2025-12-20T00:00+02:00").getTime() },
      { time: new Date("2025-12-21T00:00+02:00").getTime() },
      { time: new Date("2025-12-22T00:00+02:00").getTime() },
      { time: new Date("2025-12-23T00:00+02:00").getTime() },
      { time: new Date("2025-12-24T00:00+02:00").getTime() },
      { time: new Date("2025-12-24T23:00+02:00").getTime() },
      // { time: new Date("2025-12-25T00:00+02:00") },
    ],
  });
});

test("doesn't return hours before the hour of current time", async () => {
  const currentTime = createCurrentTime(
    new TZDate(2025, 11, 18, 13, 30, "Africa/Johannesburg")
  );
  const time = [
    new Date("2025-12-18T00:00+02:00").getTime() / 1000,
    new Date("2025-12-18T12:00+02:00").getTime() / 1000,
    new Date("2025-12-18T13:00+02:00").getTime() / 1000,
    new Date("2025-12-18T23:00+02:00").getTime() / 1000,
    new Date("2025-12-19T00:00+02:00").getTime() / 1000,
  ];

  server.use(
    http.get("https://api.open-meteo.com/v1/forecast", () => {
      return HttpResponse.json(
        createWeather({
          timezone: currentTime.timezone,
          utc_offset_seconds: currentTime.utc_offset_seconds,
          current: {
            time: currentTime.time,
          },
          hourly: createHourly({ time }),
        }) satisfies WeatherResponse
      );
    })
  );

  await expect(
    getWeather({ latitude: "0", longitude: "0" })
  ).resolves.toMatchObject({
    hourly: [
      // { time: new Date("2025-12-18T00:00+02:00") },
      // { time: new Date("2025-12-18T12:00+02:00") },
      { time: new Date("2025-12-18T13:00+02:00").getTime() },
      { time: new Date("2025-12-18T23:00+02:00").getTime() },
      { time: new Date("2025-12-19T00:00+02:00").getTime() },
    ],
  });
});

test("returns correct values for hour", async () => {
  const currentTime = createCurrentTime(
    new TZDate(2025, 11, 18, 13, 30, "Africa/Johannesburg")
  );

  server.use(
    http.get("https://api.open-meteo.com/v1/forecast", () => {
      return HttpResponse.json(
        createWeather({
          timezone: currentTime.timezone,
          utc_offset_seconds: currentTime.utc_offset_seconds,
          current: {
            time: currentTime.time,
          },
          hourly: createHourly({
            time: [
              new Date("2025-12-18T12:00+02:00").getTime() / 1000,
              new Date("2025-12-18T13:00+02:00").getTime() / 1000,
              new Date("2025-12-18T14:00+02:00").getTime() / 1000,
              new Date("2026-12-18T00:00+02:00").getTime() / 1000,
            ],
            temperature_2m: [0, 1, 2, 3],
            weather_code: [0, 1, 2, 3],
          }),
        }) satisfies WeatherResponse
      );
    })
  );

  await expect(
    getWeather({ latitude: "0", longitude: "0" })
  ).resolves.toMatchObject({
    hourly: [
      {
        time: new Date("2025-12-18T13:00+02:00").getTime(),
        temperature_2m: 1,
        weather_code: 1,
      },
      {
        time: new Date("2025-12-18T14:00+02:00").getTime(),
        temperature_2m: 2,
        weather_code: 2,
      },
    ],
  });
});

test("returns correct values for day", async () => {
  const currentTime = createCurrentTime(
    new TZDate(2025, 11, 11, 13, 30, "Africa/Johannesburg")
  );

  server.use(
    http.get("https://api.open-meteo.com/v1/forecast", () => {
      return HttpResponse.json(
        createWeather({
          timezone: currentTime.timezone,
          utc_offset_seconds: currentTime.utc_offset_seconds,
          current: {
            time: currentTime.time,
          },
          daily: createDaily({
            time: [
              new Date("2025-12-10T00:00+02:00").getTime() / 1000,
              new Date("2025-12-11T00:00+02:00").getTime() / 1000,
              new Date("2025-12-17T00:00+02:00").getTime() / 1000,
              new Date("2025-12-18T00:00+02:00").getTime() / 1000,
            ],
            temperature_2m_max: [0, 1, 2, 3],
            temperature_2m_min: [0, 1, 2, 3],
            weather_code: [0, 1, 2, 3],
          }),
        }) satisfies WeatherResponse
      );
    })
  );

  await expect(
    getWeather({ latitude: "0", longitude: "0" })
  ).resolves.toMatchObject({
    daily: [
      {
        time: new Date("2025-12-11T00:00+02:00").getTime(),
        temperature_2m_max: 1,
        temperature_2m_min: 1,
        weather_code: 1,
      },
      {
        time: new Date("2025-12-17T00:00+02:00").getTime(),
        temperature_2m_max: 2,
        temperature_2m_min: 2,
        weather_code: 2,
      },
    ],
  });
});

test.each<[Daily, boolean]>([
  [
    {
      temperature_2m_max: [],
      temperature_2m_min: [],
      time: [],
      weather_code: [],
    },
    true,
  ],
  [
    {
      temperature_2m_max: [1],
      temperature_2m_min: [],
      time: [],
      weather_code: [],
    },
    false,
  ],
  [
    {
      temperature_2m_max: [],
      temperature_2m_min: [1],
      time: [],
      weather_code: [],
    },
    false,
  ],
  [
    {
      temperature_2m_max: [],
      temperature_2m_min: [],
      time: [1],
      weather_code: [],
    },
    false,
  ],
  [
    {
      temperature_2m_max: [],
      temperature_2m_min: [],
      time: [],
      weather_code: [1],
    },
    false,
  ],
])("dailySchema parse: %o => %s", (daily, success) => {
  expect(dailySchema.safeParse(daily)).toMatchObject({ success });
});

test.each<[Hourly, boolean]>([
  [
    {
      temperature_2m: [],
      time: [],
      weather_code: [],
    },
    true,
  ],
  [
    {
      temperature_2m: [1],
      time: [],
      weather_code: [],
    },
    false,
  ],
  [
    {
      temperature_2m: [],
      time: [1],
      weather_code: [],
    },
    false,
  ],
  [
    {
      temperature_2m: [],
      time: [],
      weather_code: [1],
    },
    false,
  ],
])("hourlySchema parse: %o => %s", (daily, success) => {
  expect(hourlySchema.safeParse(daily)).toMatchObject({ success });
});
