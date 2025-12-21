import { TZDate } from "@date-fns/tz";
import { faker } from "@faker-js/faker";
import {
  addDays,
  endOfDay,
  fromUnixTime,
  getUnixTime,
  hoursToMinutes,
  isAfter,
  minutesToSeconds,
  startOfDay,
} from "date-fns";
import { secondsInMinute } from "date-fns/constants";
import * as z from "zod";

export type Interpretation = {
  alt: string;
  icon: string;
};

// [WMO Weather interpretation codes (WW)](https://open-meteo.com/en/docs#weather_variable_documentation)
export const interpretationByCode = new Map<number, Interpretation>();
// Clear sky
interpretationByCode.set(0, {
  alt: "Clear sky",
  icon: "icon-sunny",
});
// Mainly clear, partly cloudy, and overcast
interpretationByCode.set(1, {
  alt: "Mainly clear",
  // icon-partly-cloudy?
  icon: "icon-sunny",
});
interpretationByCode.set(2, {
  alt: "Partly cloudy",
  icon: "icon-partly-cloudy",
});
interpretationByCode.set(3, {
  alt: "Overcast",
  icon: "icon-overcast",
});
// Fog and depositing rime fog
interpretationByCode.set(45, {
  alt: "Fog",
  icon: "icon-fog",
});
interpretationByCode.set(48, {
  alt: "Depositing rime fog",
  icon: "icon-fog",
});
// Drizzle: Light, moderate, and dense intensity
interpretationByCode.set(51, {
  alt: "Drizzle: Light",
  icon: "icon-drizzle",
});
interpretationByCode.set(53, {
  alt: "Drizzle: Moderate",
  icon: "icon-drizzle",
});
interpretationByCode.set(55, {
  alt: "Drizzle: Dense",
  icon: "icon-drizzle",
});
// Freezing Drizzle: Light and dense intensity
interpretationByCode.set(56, {
  alt: "Freezing drizzle: Light",
  icon: "icon-drizzle",
});
interpretationByCode.set(57, {
  alt: "Freezing drizzle: Dense",
  icon: "icon-drizzle",
});
// Rain: Slight, moderate and heavy intensity
interpretationByCode.set(61, {
  alt: "Rain: Slight",
  icon: "icon-rain",
});
interpretationByCode.set(63, {
  alt: "Rain: Moderate",
  icon: "icon-rain",
});
interpretationByCode.set(65, {
  alt: "Rain: Heavy intensity",
  icon: "icon-rain",
});
// Freezing Rain: Light and heavy intensity
interpretationByCode.set(66, {
  alt: "Freezing Rain: Light",
  icon: "icon-rain",
});
interpretationByCode.set(67, {
  alt: "Freezing Rain: Heavy intensity",
  icon: "icon-rain",
});
// Snow fall: Slight, moderate, and heavy intensity
interpretationByCode.set(71, {
  alt: "Snow fall: Slight",
  icon: "icon-snow",
});
interpretationByCode.set(73, {
  alt: "Snow fall: Moderate",
  icon: "icon-snow",
});
interpretationByCode.set(75, {
  alt: "Snow fall: Heavy intensity",
  icon: "icon-snow",
});
// Snow grains
interpretationByCode.set(77, {
  alt: "Snow grains",
  icon: "icon-snow",
});
// Rain showers: Slight, moderate, and violent
interpretationByCode.set(80, {
  alt: "Rain showers: Slight",
  icon: "icon-rain",
});
interpretationByCode.set(81, {
  alt: "Rain showers: Moderate",
  icon: "icon-rain",
});
interpretationByCode.set(82, {
  alt: "Rain showers: Violent",
  icon: "icon-rain",
});
// Snow showers slight and heavy
interpretationByCode.set(85, {
  alt: "Snow showers: Slight",
  icon: "icon-snow",
});
interpretationByCode.set(86, {
  alt: "Snow showers: Heavy",
  icon: "icon-snow",
});
// Thunderstorm: Slight or moderate
interpretationByCode.set(95, {
  alt: "Thunderstorm: Slight or moderate",
  icon: "icon-storm",
});
// Thunderstorm with slight and heavy hail
interpretationByCode.set(96, {
  alt: "Thunderstorm with slight hail",
  icon: "icon-storm",
});
interpretationByCode.set(99, {
  alt: "Thunderstorm with heavy hail",
  icon: "icon-storm",
});

export const getInterpretation = (code: number) => {
  const interpretation = interpretationByCode.get(code);
  if (interpretation === undefined) {
    console.warn(`Interpretation for code ${code} not found`);
  }
  return interpretation;
};

const WeatherCode = z.number().refine((val) => interpretationByCode.has(val));

export const hourlySchema = z
  .object({
    time: z.array(z.int().positive()),
    temperature_2m: z.array(z.number()),
    weather_code: z.array(WeatherCode),
  })
  .refine(
    (val) => {
      return (
        val.time.length === val.temperature_2m.length &&
        val.time.length === val.weather_code.length
      );
    },
    { error: "Hourly data has different lengths" },
  );
export type Hourly = z.infer<typeof hourlySchema>;

export const dailySchema = z
  .object({
    time: z.array(z.int().positive()),
    weather_code: z.array(WeatherCode),
    temperature_2m_max: z.array(z.number()),
    temperature_2m_min: z.array(z.number()),
  })
  .refine(
    (val) => {
      return (
        val.time.length === val.weather_code.length &&
        val.time.length === val.temperature_2m_max.length &&
        val.time.length === val.temperature_2m_min.length
      );
    },
    { error: "Daily data has different lengths" },
  );
export type Daily = z.infer<typeof dailySchema>;

export const weatherResponseSchema = z.object({
  timezone: z.string(),
  utc_offset_seconds: z.int(),
  current: z.object({
    time: z.int().positive(),
    temperature_2m: z.number(),
    weather_code: z.number(),
    apparent_temperature: z.number(),
    wind_speed_10m: z.number(),
    precipitation: z.number(),
    relative_humidity_2m: z.number(),
  }),
  hourly: hourlySchema,
  daily: dailySchema,
});
export type WeatherResponse = z.infer<typeof weatherResponseSchema>;

export const getWeather = async ({
  latitude,
  longitude,
}: {
  latitude: string;
  longitude: string;
}) => {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?${new URLSearchParams({
      latitude,
      longitude,
      // Infer timezone from supplied coordinates
      timezone: "auto",
      timeformat: "unixtime",
      // When entering/exiting DST, the API sends the incorrect amount of values
      // Fetch 1 additional day and filter correct values here
      // https://github.com/open-meteo/open-meteo/issues/488#issuecomment-1785674368
      forecast_days: "8",
      daily: "weather_code,temperature_2m_max,temperature_2m_min",
      hourly: "temperature_2m,weather_code",
      current:
        "temperature_2m,weather_code,apparent_temperature,wind_speed_10m,precipitation,relative_humidity_2m",
    })}`,
  );
  const { hourly, daily, ...data } = weatherResponseSchema.parse(
    await response.json(),
  );

  const end = endOfDay(
    addDays(startOfDay(new TZDate(data.current.time * 1000, data.timezone)), 6),
  );
  const dailyEnd = daily.time.findIndex((time) => {
    return isAfter(time * 1000, end);
  });
  const hourlyEnd = hourly.time.findIndex((time) => {
    return isAfter(time * 1000, end);
  });

  const weather = {
    ...data,
    hourly: Array.from(
      hourly.time.slice(0, hourlyEnd === -1 ? undefined : hourlyEnd),
      (time, i) => {
        const temperature_2m = hourly.temperature_2m[i]!;
        const weather_code = hourly.weather_code[i]!;

        return {
          time: new Date(time * 1000),
          temperature_2m,
          weather_code,
        };
      },
    ),
    daily: Array.from(
      daily.time.slice(0, dailyEnd === -1 ? undefined : dailyEnd),
      (time, i) => {
        const weather_code = daily.weather_code[i]!;
        const temperature_2m_max = daily.temperature_2m_max[i]!;
        const temperature_2m_min = daily.temperature_2m_min[i]!;

        // https://github.com/open-meteo/open-meteo/issues/488#issuecomment-1790807777
        // This recreates the API bug and gives us the correct wall time, but with the incorrect offset (UTC)
        const utcWallTime = fromUnixTime(time + data.utc_offset_seconds);
        // Set the correct offset
        const localTime = new TZDate(
          utcWallTime.getUTCFullYear(),
          utcWallTime.getUTCMonth(),
          utcWallTime.getUTCDate(),
          data.timezone,
        );

        return {
          time: localTime,
          weather_code,
          temperature_2m_max,
          temperature_2m_min,
        };
      },
    ),
  };
  return weather;
};
export type Weather = Awaited<ReturnType<typeof getWeather>>;

const createTemperature = () => {
  return faker.number.float({ max: 50 });
};

const createWeatherCode = () => {
  return faker.helpers.arrayElement([...interpretationByCode.keys()]);
};

const createTime = () => {
  return getUnixTime(faker.date.anytime());
};

// Source - https://stackoverflow.com/a/51365037
// Posted by Jeffrey Patterson, modified by community. See post 'Timeline' for change history
// Retrieved 2025-11-27, License - CC BY-SA 4.0
type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object | undefined
      ? RecursivePartial<T[P]>
      : T[P];
};

/**
 * Creates `current.time` and values dependent on it
 */
export const createCurrentTime = (time: TZDate) => {
  return {
    timezone: time.timeZone,
    utc_offset_seconds: -minutesToSeconds(time.getTimezoneOffset()),
    current: {
      time: getUnixTime(time),
    },
  };
};

export const createDaily = (
  daily?: Partial<WeatherResponse["daily"]>,
): WeatherResponse["daily"] => {
  const length =
    daily?.time?.length ??
    daily?.temperature_2m_max?.length ??
    daily?.temperature_2m_min?.length ??
    daily?.weather_code?.length ??
    7;

  return {
    time:
      daily?.time ??
      Array.from({ length }, () => {
        return createTime();
      }),
    temperature_2m_max:
      daily?.temperature_2m_max ??
      Array.from({ length }, () => {
        return createTemperature();
      }),
    temperature_2m_min:
      daily?.temperature_2m_min ??
      Array.from({ length }, () => {
        return createTemperature();
      }),
    weather_code:
      daily?.weather_code ??
      Array.from({ length }, () => {
        return createWeatherCode();
      }),
  };
};

export const createHourly = (
  hourly?: Partial<WeatherResponse["hourly"]>,
): WeatherResponse["hourly"] => {
  const length =
    hourly?.time?.length ??
    hourly?.temperature_2m?.length ??
    hourly?.weather_code?.length ??
    // All days aren't 24 hours long, so be careful out there
    24 * 7;

  return {
    time:
      hourly?.time ??
      Array.from({ length }, () => {
        return createTime();
      }),
    temperature_2m:
      hourly?.temperature_2m ??
      Array.from({ length }, () => {
        return createTemperature();
      }),
    weather_code:
      hourly?.weather_code ??
      Array.from({ length }, () => {
        return createWeatherCode();
      }),
  };
};

export const createWeather = (
  overwrites?: RecursivePartial<WeatherResponse>,
): WeatherResponse => {
  return {
    timezone: overwrites?.timezone ?? faker.location.timeZone(),
    utc_offset_seconds:
      overwrites?.utc_offset_seconds ??
      faker.number.int({
        min: -hoursToMinutes(12),
        max: hoursToMinutes(14),
        multipleOf: secondsInMinute,
      }),
    current: {
      apparent_temperature: createTemperature(),
      precipitation: faker.number.float({ max: 1000 }),
      relative_humidity_2m: faker.number.int({ max: 100 }),
      temperature_2m: createTemperature(),
      time: createTime(),
      weather_code: createWeatherCode(),
      wind_speed_10m: faker.number.float({ max: 100 }),
      ...overwrites?.current,
    },
    daily: {
      temperature_2m_max: faker.helpers.multiple(() => createTemperature()),
      temperature_2m_min: faker.helpers.multiple(() => createTemperature()),
      time: faker.helpers.multiple(() => createTime()),
      weather_code: faker.helpers.multiple(() => createWeatherCode()),
      ...overwrites?.daily,
    },
    hourly: {
      temperature_2m: faker.helpers.multiple(() => createTemperature()),
      time: faker.helpers.multiple(() => createTime()),
      weather_code: faker.helpers.multiple(() => createWeatherCode()),
      ...overwrites?.hourly,
    },
  };
};
